import { SITE_URL, EMAIL_ASSET_BASE } from "@/lib/site";

// Modulo senza dipendenze server-only (niente Resend/Node): può essere importato sia
// dal server (invio reale) sia dal client (anteprima dal vivo nel form di broadcast),
// garantendo che l'anteprima mostrata all'admin sia identica all'email davvero inviata.

// Neutralizza i caratteri HTML in testo libero (oggetto/messaggio broadcast, estratti,
// nomi) prima di inserirlo in un template email: senza questo, un account admin
// compromesso potrebbe iniettare HTML/script arbitrario nelle email inviate a tutti i membri.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Trasforma il testo libero scritto nel form in paragrafi HTML: una riga vuota separa
// due paragrafi, un singolo a-capo diventa <br/>. Usata sia per l'invio reale sia per
// l'anteprima, così coincidono sempre.
export function messageToHtml(message: string): string {
  return message
    .split(/\n{2,}/)
    .filter((p) => p.trim().length > 0)
    .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/**
 * Template email brandizzato (HTML con stili inline, compatibile con i client email)
 * usato sia per le email broadcast dell'admin sia per le notifiche automatiche di nuovi contenuti.
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
    <body style="margin:0;padding:0;background:#eff8ff;font-family:Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eff8ff;padding:40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #d5eaf9;box-shadow:0 2px 24px rgba(12,74,110,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#0c4a6e,#0284c7);padding:36px 32px;text-align:center;">
                  <img
                    src="${EMAIL_ASSET_BASE}/logo-icon.png"
                    width="52"
                    height="52"
                    alt="Yoga Stargate"
                    style="display:block;margin:0 auto 10px;border-radius:12px;background:#ffffff;padding:6px;"
                  />
                  <span style="font-size:19px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">Stargate</span>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 32px 8px;">
                  <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:#0c4a6e;font-family:Georgia,serif;">${escapeHtml(title)}</h1>
                  <div style="font-size:15px;line-height:1.65;color:#334155;">${bodyHtml}</div>
                  ${
                    ctaLabel && ctaUrl
                      ? `<div style="margin-top:30px;text-align:center;">
                          <a href="${ctaUrl}" style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 30px;border-radius:10px;">${escapeHtml(ctaLabel)}</a>
                         </div>`
                      : ""
                  }
                </td>
              </tr>
              <tr>
                <td style="padding:26px 32px;background:#f5fafe;text-align:center;border-top:1px solid #e5f1fa;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                    Yoga Stargate — Via Zanella 56, Milano<br/>
                    <a href="${SITE_URL}" style="color:#0284c7;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
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
