import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmailBatch, invitationEmail, emailConfigured, type BatchEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

// Chi era già nella lista contatti del vecchio sito viene importato come account senza
// password (passwordHash nullo: nessuno può entrarci finché non sceglie la propria dal link).
// "Da invitare" = account MEMBER senza password, senza Google, che non ha ancora nessun link
// di reimpostazione emesso: appena parte l'invito, il link esiste e l'account esce dall'elenco,
// quindi ogni persona riceve l'invito una volta sola anche se si preme più volte il pulsante.
export const pendingInvitesWhere = {
  role: "MEMBER" as const,
  passwordHash: null,
  googleId: null,
  passwordResetTokens: { none: {} },
};

export const INVITE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 giorni: l'invito può restare in casella a lungo
const BATCH_SIZE = 50;
const REPLY_TO = "info@yogastargate.com";
export const INVITE_SUBJECT = "Il nuovo portale Yoga Stargate è online: scegli la tua password";

// Nome usato per chi non aveva lasciato il nome sul vecchio sito ("Amica/o"): in quel caso
// l'email saluta con un semplice "Ciao," invece di "Ciao Amica/o,".
const PLACEHOLDER_NAME = "Amica/o";

export function greetingName(fullName: string): string | null {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  if (!first || fullName.trim() === PLACEHOLDER_NAME || /[\d@]/.test(first)) return null;
  return first;
}

export async function countPendingInvites(): Promise<number> {
  return prisma.account.count({ where: pendingInvitesWhere });
}

/** Invia l'invito a un gruppo di contatti importati. Restituisce quanti sono partiti e quanti restano. */
export async function sendInviteBatch(): Promise<{ sent: number; remaining: number; error?: string }> {
  if (!emailConfigured()) return { sent: 0, remaining: await countPendingInvites(), error: "Invio email non configurato." };

  const accounts = await prisma.account.findMany({
    where: pendingInvitesWhere,
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true, email: true, name: true },
  });
  if (accounts.length === 0) return { sent: 0, remaining: 0 };

  const tokens = accounts.map((a) => ({
    account: a,
    token: crypto.randomBytes(32).toString("base64url"),
  }));

  // Prima si registrano i link: se poi l'invio fallisce li si toglie, così le persone restano "da invitare".
  await prisma.passwordResetToken.createMany({
    data: tokens.map((t) => ({
      token: t.token,
      accountId: t.account.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    })),
  });

  const emails: BatchEmail[] = tokens.map((t) => ({
    to: t.account.email,
    subject: INVITE_SUBJECT,
    html: invitationEmail({
      firstName: greetingName(t.account.name),
      resetUrl: `${SITE_URL}/reimposta-password?token=${t.token}`,
    }),
    replyTo: REPLY_TO,
  }));

  const result = await sendEmailBatch(emails);
  if (!result.ok) {
    await prisma.passwordResetToken.deleteMany({ where: { token: { in: tokens.map((t) => t.token) } } });
    return { sent: 0, remaining: await countPendingInvites(), error: "Invio non riuscito: riprova tra poco." };
  }

  return { sent: accounts.length, remaining: await countPendingInvites() };
}

/** Invia a un indirizzo (di solito quello dell'admin) un esempio dell'email, con un link finto. */
export async function sendInvitePreview(to: string, firstName: string | null) {
  return sendEmailBatch([
    {
      to,
      subject: `[PROVA] ${INVITE_SUBJECT}`,
      html: invitationEmail({ firstName, resetUrl: `${SITE_URL}/reimposta-password?token=anteprima` }),
      replyTo: REPLY_TO,
    },
  ]);
}
