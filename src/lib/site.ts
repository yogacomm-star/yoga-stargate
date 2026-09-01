export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yogastargate.com";

// Origine da cui le email caricano le immagini (il logo dell'intestazione). Di norma coincide
// con il sito stesso; si può puntarla altrove con NEXT_PUBLIC_EMAIL_ASSET_BASE nei periodi in
// cui SITE_URL è un dominio non ancora collegato o propagato — le email restano nella casella
// dei destinatari per mesi, quindi devono continuare a caricare anche dopo un cambio dominio.
// Se la si imposta a un'origine diversa dal sito, va autorizzata anche nella CSP (next.config.ts,
// che legge la stessa variabile) o il browser bloccherà l'anteprima nel pannello admin.
export const EMAIL_ASSET_BASE = (process.env.NEXT_PUBLIC_EMAIL_ASSET_BASE || SITE_URL).replace(/\/$/, "");
export const SITE_NAME = "Yoga Stargate";
export const SITE_DESCRIPTION =
  "Yoga Stargate è la scuola di yoga multidimensionale di Tina Mastandrea a Milano: lezioni settimanali, corsi online, ritiri e viaggi yoga in Italia e nel mondo.";
export const SITE_KEYWORDS = [
  "yoga Milano",
  "yoga multidimensionale",
  "lezioni yoga Milano",
  "ritiri yoga",
  "ritiri yoga Italia",
  "corsi yoga online",
  "meditazione",
  "Tina Mastandrea",
  "Yoga Stargate",
  "viaggi yoga",
];
