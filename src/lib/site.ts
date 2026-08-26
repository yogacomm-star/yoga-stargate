export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yogastargate.com";

// Dominio sempre raggiungibile su Netlify (resta attivo anche dopo aver collegato un
// dominio personalizzato): usato per gli asset delle email, che devono caricare anche
// quando SITE_URL punta a un dominio non ancora collegato/propagato.
export const EMAIL_ASSET_BASE = "https://yoga-stargate.netlify.app";
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
