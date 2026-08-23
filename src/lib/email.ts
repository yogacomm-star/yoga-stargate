import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import { prisma } from "@/lib/prisma";

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
 * Notifica automaticamente gli iscritti alla newsletter quando viene pubblicato
 * un nuovo ritiro, corso o articolo. Non blocca né fa fallire la richiesta chiamante
 * se l'invio non è configurato o fallisce: è un "best effort" in background.
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
    const subs = await prisma.newsletterSubscriber.findMany({ select: { email: true } });
    if (subs.length === 0) return;

    const kindLabel = kind === "ritiro" ? "Nuovo ritiro" : kind === "corso" ? "Nuovo corso" : "Nuovo articolo";
    const html = brandedEmail({
      title: `${kindLabel}: ${title}`,
      bodyHtml: `<p style="margin:0 0 12px;">${excerpt}</p>`,
      ctaLabel: "Scopri di più",
      ctaUrl: url,
    });

    await Promise.all(subs.map((s) => sendEmail({ to: s.email, subject: `${kindLabel} su Yoga Stargate`, html })));
  } catch {
    // Invio best-effort: eventuali errori non devono far fallire la pubblicazione del contenuto.
  }
}

/**
 * Template email brandizzato (HTML con stili inline, compatibile con i client email)
 * usato sia per la newsletter broadcast sia per le notifiche automatiche di nuovi contenuti.
 */
export function brandedEmail({
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  return `
  <!doctype html>
  <html lang="it">
    <body style="margin:0;padding:0;background:#f0f9ff;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #bae6fd;">
              <tr>
                <td style="background:linear-gradient(135deg,#0284c7,#0c4a6e);padding:28px 32px;text-align:center;">
                  <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">Yoga Stargate</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <h1 style="margin:0 0 16px;font-size:22px;color:#0c4a6e;font-family:Georgia,serif;">${title}</h1>
                  <div style="font-size:15px;line-height:1.6;color:#334155;">${bodyHtml}</div>
                  ${
                    ctaLabel && ctaUrl
                      ? `<div style="margin-top:28px;text-align:center;">
                          <a href="${ctaUrl}" style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;">${ctaLabel}</a>
                         </div>`
                      : ""
                  }
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px;background:#f0f9ff;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#64748b;">
                    Yoga Stargate — Via Zanella 56, Milano · <a href="${SITE_URL}" style="color:#0284c7;">${SITE_URL.replace("https://", "")}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
