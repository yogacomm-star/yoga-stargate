import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { escapeHtml, brandedEmail } from "@/lib/emailTemplate";

export { escapeHtml, brandedEmail, messageToHtml } from "@/lib/emailTemplate";

const FROM = process.env.EMAIL_FROM || "Yoga Stargate <onboarding@resend.dev>";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getClient();
  if (!client) return { ok: false, error: "not_configured" };

  try {
    const { error } = await client.emails.send({ from: FROM, to, subject, html });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

/**
 * Notifica automaticamente i membri che hanno dato il consenso email quando viene
 * pubblicato un nuovo ritiro, corso o articolo. Non blocca né fa fallire la richiesta
 * chiamante se l'invio non è configurato o fallisce: è un "best effort" in background.
 */
export async function notifyNewContent({
  kind,
  title,
  excerpt,
  url,
}: {
  kind: "ritiro" | "corso" | "articolo";
  title: string;
  excerpt: string;
  url: string;
}) {
  if (!emailConfigured()) return;

  try {
    const subs = await prisma.account.findMany({
      where: { role: "MEMBER", marketingConsent: true },
      select: { email: true },
    });
    if (subs.length === 0) return;

    const kindLabel = kind === "ritiro" ? "Nuovo ritiro" : kind === "corso" ? "Nuovo corso" : "Nuovo articolo";
    const html = brandedEmail({
      title: `${kindLabel}: ${title}`,
      bodyHtml: `<p style="margin:0 0 12px;">${escapeHtml(excerpt)}</p>`,
      ctaLabel: "Scopri di più",
      ctaUrl: url,
    });

    await Promise.all(subs.map((s) => sendEmail({ to: s.email, subject: `${kindLabel} su Yoga Stargate`, html })));
  } catch {
    // Invio best-effort: eventuali errori non devono far fallire la pubblicazione del contenuto.
  }
}
