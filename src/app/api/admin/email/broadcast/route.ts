import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sendEmail, brandedEmail, emailConfigured, messageToHtml, unsubscribeHeaders } from "@/lib/email";
import { unsubscribeUrl, unsubscribeApiUrl } from "@/lib/unsubscribe";
import { createCampaign } from "@/lib/newsletter";

const buttonSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z.string().trim().url().max(500),
});

const schema = z.object({
  audience: z.enum(["consenting", "members"]),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  buttons: z.array(buttonSchema).max(2).optional(),
  attachmentUrl: z.string().trim().url().max(1000).optional(),
  attachmentName: z.string().trim().max(150).optional(),
  // Invia solo all'admin che ha premuto il pulsante, per vedere l'email prima di spedirla a
  // tutti: stesso contenuto (testo, pulsanti, allegato) della vera newsletter, non un modello fisso.
  test: z.boolean().optional(),
});

// Questa richiesta NON spedisce la newsletter a tutti: ne registra l'invio (fissa l'elenco dei
// destinatari) e restituisce l'id della campagna. La spedizione vera avviene a gruppi tramite
// /api/admin/email/campaigns/[id]/send, richiamato finché non resta nessuno: così un limite del
// servizio email o un timeout non lasciano più persone senza email e senza che si sappia chi.
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "L'invio email non è ancora configurato. Aggiungi RESEND_API_KEY nelle variabili d'ambiente." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const { audience, subject, message, buttons, attachmentUrl, attachmentName, test } = parsed.data;

  if (test) {
    const html = brandedEmail({
      title: subject,
      bodyHtml: messageToHtml(message),
      buttons,
      unsubscribeUrl: unsubscribeUrl(admin.id),
    });
    const result = await sendEmail({
      to: admin.email,
      subject: `[PROVA] ${subject}`,
      html,
      headers: unsubscribeHeaders(unsubscribeApiUrl(admin.id)),
      attachment: attachmentUrl ? { filename: attachmentName || "allegato.pdf", path: attachmentUrl } : undefined,
    });
    if (!result.ok) return NextResponse.json({ error: "Invio della prova non riuscito." }, { status: 502 });
    return NextResponse.json({ ok: true, test: true, to: admin.email });
  }

  try {
    const campaign = await createCampaign({
      audience,
      subject,
      message,
      buttons: buttons ?? [],
      attachmentUrl,
      attachmentName,
    });
    if (!campaign) return NextResponse.json({ error: "Non ci sono destinatari per questa email." }, { status: 400 });
    return NextResponse.json({ ok: true, campaignId: campaign.id, total: campaign.total });
  } catch {
    return NextResponse.json(
      { error: "Impossibile registrare l'invio. Se l'errore si ripete, il database potrebbe non essere aggiornato." },
      { status: 500 }
    );
  }
}
