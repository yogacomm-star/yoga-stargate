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
                <td style="background:linear-gradient(135deg,#8e7cc3,#1673b6);padding:36px 32px;text-align:center;">
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
                  <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:#1f333f;font-family:Georgia,serif;">${escapeHtml(title)}</h1>
                  <div style="font-size:15px;line-height:1.65;color:#334155;">${bodyHtml}</div>
                  ${
                    ctaLabel && ctaUrl
                      ? `<div style="margin-top:30px;text-align:center;">
                          <a href="${ctaUrl}" style="display:inline-block;background:#1673b6;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 30px;border-radius:10px;">${escapeHtml(ctaLabel)}</a>
                         </div>`
                      : ""
                  }
                </td>
              </tr>
              <tr>
                <td style="padding:26px 32px;background:#f5fafe;text-align:center;border-top:1px solid #e5f1fa;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                    Yoga Stargate — Rimembranze di Lambrate 16, Milano<br/>
                    <a href="${SITE_URL}" style="color:#1673b6;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
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

/**
 * Email di invito per chi aveva già lasciato i suoi dati sul vecchio sito: spiega che il sito
 * sta cambiando, che l'account è già pronto e porta a scegliere la password. Stessa palette
 * del template standard, ma con un'impostazione più "editoriale" (novità in evidenza, un solo
 * grande pulsante). Stili inline e tabelle: è l'unico modo affidabile nei client email.
 */
export function invitationEmail({ firstName, resetUrl }: { firstName: string | null; resetUrl: string }): string {
  const greeting = firstName ? `Ciao ${escapeHtml(firstName)},` : "Ciao,";

  const feature = (emoji: string, title: string, text: string) => `
    <tr>
      <td width="44" valign="top" style="padding:0 0 16px;">
        <div style="width:38px;height:38px;line-height:38px;text-align:center;font-size:19px;background:#eef2fb;border-radius:12px;">${emoji}</div>
      </td>
      <td valign="top" style="padding:0 0 16px 12px;">
        <div style="font-size:15px;font-weight:700;color:#1f333f;">${title}</div>
        <div style="font-size:14px;line-height:1.55;color:#475569;margin-top:2px;">${text}</div>
      </td>
    </tr>`;

  return `
  <!doctype html>
  <html lang="it">
    <body style="margin:0;padding:0;background:#eff8ff;font-family:Helvetica,Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
        Il sito di Yoga Stargate è cambiato: il tuo spazio è già pronto, basta scegliere la password.
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eff8ff;padding:32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #d5eaf9;box-shadow:0 4px 32px rgba(12,74,110,0.10);">
              <tr>
                <td style="background:#5b6fc0;background-image:linear-gradient(135deg,#8e7cc3 0%,#4f6fc4 55%,#1673b6 100%);padding:40px 32px 34px;text-align:center;">
                  <img src="${EMAIL_ASSET_BASE}/logo-icon.png" width="64" height="64" alt="Yoga Stargate"
                    style="display:block;margin:0 auto 12px;border-radius:16px;background:#ffffff;padding:7px;" />
                  <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">Stargate</div>
                  <div style="font-size:11px;font-weight:600;color:#dbe7fb;letter-spacing:5px;text-transform:uppercase;margin-top:4px;">Yoga</div>
                  <div style="height:1px;width:56px;background:rgba(255,255,255,0.45);margin:22px auto 18px;"></div>
                  <div style="font-family:Georgia,serif;font-size:27px;line-height:1.25;color:#ffffff;">Il portale si è rinnovato</div>
                  <div style="font-size:14px;color:#e6eefc;margin-top:8px;">Un nuovo spazio, pensato per te.</div>
                </td>
              </tr>

              <tr>
                <td style="padding:34px 32px 6px;">
                  <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#1f333f;font-weight:600;">${greeting}</p>
                  <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
                    ti scrivo perché fai parte della community di Yoga Stargate: in passato hai scelto di restare in
                    contatto con noi, e voglio dirti per prima/o una bella notizia.
                  </p>
                  <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#334155;">
                    <strong>Il sito sta cambiando.</strong> Abbiamo costruito un nuovo spazio, più semplice e più ricco,
                    dove ritrovare in un unico posto tutto quello che ti accompagna nel percorso:
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafe;border:1px solid #e2eefa;border-radius:20px;">
                    <tr>
                      <td style="padding:22px 22px 6px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          ${feature("🎧", "Percorsi online", "Meditazioni e pratiche guidate da Tina, da vivere quando e dove vuoi. In regalo per te il percorso gratuito Om Shaant.")}
                          ${feature("🗓️", "Eventi", "Masterclass, workshop, ritiri e viaggi, ognuno con la sua scheda, le foto e la prenotazione online.")}
                          ${feature("🌿", "Il tuo spazio personale", "I tuoi percorsi, i preferiti e le novità sempre con te, anche da cellulare.")}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:26px 0 8px;font-size:15px;line-height:1.7;color:#334155;">
                    <strong>Il tuo account è già stato creato</strong> con questo indirizzo email. Ti basta scegliere la tua
                    password per entrare:
                  </p>

                  <div style="margin:22px 0 10px;text-align:center;">
                    <a href="${resetUrl}" style="display:inline-block;background:#1673b6;background-image:linear-gradient(135deg,#4f6fc4,#1673b6);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 38px;border-radius:14px;box-shadow:0 6px 18px rgba(22,115,182,0.30);">
                      Scegli la mia password
                    </a>
                  </div>
                  <p style="margin:0 0 6px;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
                    Il link è personale e valido 30 giorni. Se non funziona, dalla pagina di accesso puoi chiedere un
                    nuovo link con «Password dimenticata».
                  </p>

                  <p style="margin:30px 0 4px;font-size:15px;line-height:1.7;color:#334155;">Ti aspetto nel nuovo portale.</p>
                  <p style="margin:0 0 30px;font-family:Georgia,serif;font-size:19px;color:#1f333f;">Con gratitudine,<br/>Tina Mastandrea</p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 32px;background:#f5fafe;text-align:center;border-top:1px solid #e5f1fa;">
                  <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:#64748b;">
                    Yoga Stargate — Rimembranze di Lambrate 16, Milano<br/>
                    <a href="${SITE_URL}" style="color:#1673b6;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
                  </p>
                  <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">
                    Ricevi questo messaggio perché ti eri iscritta/o alla mailing list di Yoga Stargate. Se non vuoi più
                    ricevere le nostre email, rispondi a questo messaggio scrivendo «cancellami».
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
