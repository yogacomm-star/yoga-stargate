import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { escapeHtml, brandedEmail } from "@/lib/emailTemplate";
import { SITE_URL } from "@/lib/site";

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
 * Email automatica di benvenuto alla creazione di un nuovo account (registrazione classica
 * o primo accesso con Google). "Best effort": non deve mai far fallire la registrazione.
 */
export async function sendWelcomeEmail({ email, name }: { email: string; name: string }) {
  if (!emailConfigured()) return;
  try {
    const html = brandedEmail({
      title: `Benvenuta/o su Yoga Stargate, ${escapeHtml(name)}!`,
      bodyHtml: `<p style="margin:0 0 12px;">Il tuo account è pronto. Da qui puoi seguire i tuoi corsi, salvare i preferiti e restare aggiornata/o su ritiri e novità.</p>`,
      ctaLabel: "Vai al mio account",
      ctaUrl: `${SITE_URL}/account`,
    });
    await sendEmail({ to: email, subject: "Benvenuta/o su Yoga Stargate", html });
  } catch {
    // best-effort: un problema nell'invio non deve mai bloccare la creazione dell'account.
  }
}

/**
 * Email automatica di conferma quando un pagamento corso va a buon fine. "Best effort":
 * non deve mai far fallire la registrazione dell'acquisto né il webhook di Stripe.
 */
export async function sendPurchaseConfirmationEmail({
  email,
  courseTitle,
  courseSlug,
  amount,
}: {
  email: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
}) {
  if (!emailConfigured()) return;
  try {
    const html = brandedEmail({
      title: "Pagamento riuscito, corso sbloccato!",
      bodyHtml: `<p style="margin:0 0 12px;">Hai acquistato <strong>${escapeHtml(courseTitle)}</strong> per ${amount.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}.</p><p style="margin:0;">Lo trovi da subito nella pagina del corso e in ogni momento in "Il mio account".</p>`,
      ctaLabel: "Apri il corso",
      ctaUrl: `${SITE_URL}/corsi/${courseSlug}`,
    });
    await sendEmail({ to: email, subject: `Acquisto confermato: ${courseTitle}`, html });
  } catch {
    // best-effort: un problema nell'invio non deve mai far fallire la registrazione dell'acquisto.
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
