import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { brandedEmail, messageToHtml, sendEmail, sendEmailBatch, unsubscribeHeaders, type BatchEmail } from "@/lib/email";
import { unsubscribeUrl, unsubscribeApiUrl } from "@/lib/unsubscribe";

// Newsletter con registro degli invii. Prima l'email partiva in un unico ciclo dentro una sola
// richiesta: se il servizio email raggiungeva il limite giornaliero (o la richiesta andava in
// timeout) il resto delle persone restava senza e non c'era modo di sapere chi. Ora ogni invio è
// una "campagna": l'elenco dei destinatari viene fissato all'inizio, si spedisce a gruppi, e per
// ognuno resta scritto l'esito. Se si ferma, si riprende da dove era arrivato senza mai
// mandare due volte la stessa email alla stessa persona.

export type CampaignButton = { label: string; url: string };

// Resend non accetta allegati nell'invio "a gruppo": con un allegato si spedisce una email per
// volta (con una pausa, per restare sotto il limite di richieste al secondo del servizio).
const BATCH_SIZE = 100;
const BATCH_SIZE_WITH_ATTACHMENT = 15;
const PAUSE_BETWEEN_SINGLE_SENDS_MS = 550;

const QUOTA = /quota/i;
const RATE_LIMIT = /rate[_ ]limit|too many requests/i;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function parseButtons(raw: string): CampaignButton[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.filter((b): b is CampaignButton => typeof b?.label === "string" && typeof b?.url === "string")
      : [];
  } catch {
    return [];
  }
}

export async function audienceCounts(): Promise<{ consenting: number; members: number }> {
  const [consenting, members] = await Promise.all([
    prisma.account.count({ where: { role: "MEMBER", marketingConsent: true } }),
    prisma.account.count({ where: { role: "MEMBER" } }),
  ]);
  return { consenting, members };
}

export async function createCampaign(input: {
  audience: "consenting" | "members";
  subject: string;
  message: string;
  buttons: CampaignButton[];
  attachmentUrl?: string;
  attachmentName?: string;
}): Promise<{ id: string; total: number } | null> {
  const members = await prisma.account.findMany({
    where: { role: "MEMBER", ...(input.audience === "consenting" ? { marketingConsent: true } : {}) },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  if (members.length === 0) return null;

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject: input.subject,
      message: input.message,
      buttons: JSON.stringify(input.buttons),
      attachmentUrl: input.attachmentUrl ?? null,
      attachmentName: input.attachmentName ?? null,
      audience: input.audience,
    },
  });
  await prisma.emailCampaignRecipient.createMany({
    data: members.map((m) => ({ campaignId: campaign.id, accountId: m.id, email: m.email, name: m.name })),
  });
  return { id: campaign.id, total: members.length };
}

type CampaignRow = NonNullable<Awaited<ReturnType<typeof prisma.emailCampaign.findUnique>>>;

function renderHtml(campaign: CampaignRow, recipient: { id: string; accountId: string }): string {
  // I pulsanti passano da un nostro indirizzo che registra il clic e poi inoltra alla pagina vera:
  // l'indirizzo di destinazione non sta nel link (niente reindirizzamenti aperti), si legge dalla campagna.
  const buttons = parseButtons(campaign.buttons).map((b, i) => ({
    label: b.label,
    url: `${SITE_URL}/api/n/c?r=${recipient.id}&b=${i + 1}`,
  }));
  return brandedEmail({
    title: campaign.subject,
    bodyHtml: messageToHtml(campaign.message),
    buttons,
    unsubscribeUrl: unsubscribeUrl(recipient.accountId, recipient.id),
    trackingPixelUrl: `${SITE_URL}/api/n/o?r=${recipient.id}`,
  });
}

export type BatchOutcome = {
  sent: number; // partite in questo giro
  failed: number; // rifiutate in questo giro (es. indirizzo non valido)
  pending: number; // ancora da inviare in tutta la campagna
  stopped?: "quota" | "rate" | "error";
  message?: string;
};

async function pendingCount(campaignId: string): Promise<number> {
  return prisma.emailCampaignRecipient.count({ where: { campaignId, status: "PENDING" } });
}

/** Spedisce il prossimo gruppo di destinatari ancora in attesa. */
export async function sendNextBatch(campaignId: string): Promise<BatchOutcome> {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campagna non trovata.");

  const size = campaign.attachmentUrl ? BATCH_SIZE_WITH_ATTACHMENT : BATCH_SIZE;
  const rows = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId, status: "PENDING" },
    orderBy: { id: "asc" },
    take: size,
  });
  if (rows.length === 0) return { sent: 0, failed: 0, pending: 0 };

  let sent = 0;
  let failed = 0;

  if (!campaign.attachmentUrl) {
    const emails: BatchEmail[] = rows.map((r) => ({
      to: r.email,
      subject: campaign.subject,
      html: renderHtml(campaign, r),
      headers: unsubscribeHeaders(unsubscribeApiUrl(r.accountId, r.id)),
    }));

    // Stessa chiave = stesso gruppo: se la richiesta viene ripetuta dopo un'interruzione, il
    // servizio email non spedisce una seconda volta.
    const key = `nl-${campaignId}-${rows[0].id}-${rows.length}`;
    let result = await sendEmailBatch(emails, { idempotencyKey: key });
    if (!result.ok && RATE_LIMIT.test(`${result.errorName} ${result.error}`)) {
      await sleep(1500);
      result = await sendEmailBatch(emails, { idempotencyKey: key });
    }

    if (!result.ok) {
      const text = `${result.errorName ?? ""} ${result.error ?? ""}`;
      return {
        sent: 0,
        failed: 0,
        pending: await pendingCount(campaignId),
        stopped: QUOTA.test(text) ? "quota" : RATE_LIMIT.test(text) ? "rate" : "error",
        message: result.error,
      };
    }

    const failedIdx = new Map<number, string>();
    (result.failedIndexes ?? []).forEach((idx, i) => failedIdx.set(idx, result.failedReasons?.[i] ?? "Rifiutata"));

    const okIds = rows.filter((_, i) => !failedIdx.has(i)).map((r) => r.id);
    if (okIds.length) {
      await prisma.emailCampaignRecipient.updateMany({
        where: { id: { in: okIds } },
        data: { status: "SENT", sentAt: new Date(), error: null },
      });
    }
    for (const [idx, reason] of failedIdx) {
      await prisma.emailCampaignRecipient.update({
        where: { id: rows[idx].id },
        data: { status: "FAILED", error: reason.slice(0, 300) },
      });
    }
    sent = okIds.length;
    failed = failedIdx.size;
  } else {
    const attachment = {
      filename: campaign.attachmentName || "allegato.pdf",
      path: campaign.attachmentUrl,
    };
    for (const r of rows) {
      const args = {
        to: r.email,
        subject: campaign.subject,
        html: renderHtml(campaign, r),
        headers: unsubscribeHeaders(unsubscribeApiUrl(r.accountId, r.id)),
        attachment,
        idempotencyKey: `nl-${campaignId}-${r.id}`,
      };
      let result = await sendEmail(args);
      if (!result.ok && RATE_LIMIT.test(`${result.errorName} ${result.error}`)) {
        await sleep(1500);
        result = await sendEmail(args);
      }

      if (result.ok) {
        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: { status: "SENT", sentAt: new Date(), error: null },
        });
        sent += 1;
      } else {
        const text = `${result.errorName ?? ""} ${result.error ?? ""}`;
        if (QUOTA.test(text) || RATE_LIMIT.test(text)) {
          // Non è colpa di questo indirizzo: si ferma, il resto resta in attesa.
          return {
            sent,
            failed,
            pending: await pendingCount(campaignId),
            stopped: QUOTA.test(text) ? "quota" : "rate",
            message: result.error,
          };
        }
        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: { status: "FAILED", error: (result.error ?? "Errore").slice(0, 300) },
        });
        failed += 1;
      }
      await sleep(PAUSE_BETWEEN_SINGLE_SENDS_MS);
    }
  }

  return { sent, failed, pending: await pendingCount(campaignId) };
}

/** Rimette in attesa gli indirizzi non raggiunti, per riprovare. Restituisce quanti sono. */
export async function requeueFailed(campaignId: string): Promise<number> {
  const res = await prisma.emailCampaignRecipient.updateMany({
    where: { campaignId, status: "FAILED" },
    data: { status: "PENDING", error: null },
  });
  return res.count;
}

export type CampaignStats = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  opened: number;
  clicked: number;
  clickedButton1: number;
  clickedButton2: number;
  unsubscribed: number;
};

const EMPTY_STATS: CampaignStats = {
  total: 0,
  sent: 0,
  failed: 0,
  pending: 0,
  opened: 0,
  clicked: 0,
  clickedButton1: 0,
  clickedButton2: 0,
  unsubscribed: 0,
};

/** Statistiche di più campagne in poche richieste (non una per campagna). */
export async function statsFor(campaignIds: string[]): Promise<Map<string, CampaignStats>> {
  const out = new Map<string, CampaignStats>(campaignIds.map((id) => [id, { ...EMPTY_STATS }]));
  if (campaignIds.length === 0) return out;

  const where = { campaignId: { in: campaignIds } };
  const [byStatus, opened, clicked, b1, b2, unsub] = await Promise.all([
    prisma.emailCampaignRecipient.groupBy({ by: ["campaignId", "status"], where, _count: { _all: true } }),
    prisma.emailCampaignRecipient.groupBy({ by: ["campaignId"], where: { ...where, openedAt: { not: null } }, _count: { _all: true } }),
    prisma.emailCampaignRecipient.groupBy({ by: ["campaignId"], where: { ...where, clickedAt: { not: null } }, _count: { _all: true } }),
    prisma.emailCampaignRecipient.groupBy({ by: ["campaignId"], where: { ...where, clickedButton1: { not: null } }, _count: { _all: true } }),
    prisma.emailCampaignRecipient.groupBy({ by: ["campaignId"], where: { ...where, clickedButton2: { not: null } }, _count: { _all: true } }),
    prisma.emailCampaignRecipient.groupBy({ by: ["campaignId"], where: { ...where, unsubscribedAt: { not: null } }, _count: { _all: true } }),
  ]);

  for (const r of byStatus) {
    const s = out.get(r.campaignId)!;
    s.total += r._count._all;
    if (r.status === "SENT") s.sent = r._count._all;
    else if (r.status === "FAILED") s.failed = r._count._all;
    else s.pending = r._count._all;
  }
  const fill = (rows: { campaignId: string; _count: { _all: number } }[], key: keyof CampaignStats) => {
    for (const r of rows) out.get(r.campaignId)![key] = r._count._all;
  };
  fill(opened, "opened");
  fill(clicked, "clicked");
  fill(b1, "clickedButton1");
  fill(b2, "clickedButton2");
  fill(unsub, "unsubscribed");
  return out;
}
