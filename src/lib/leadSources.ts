// Provenienze possibili per un ContactLead: usate sia per validare l'input dei form
// pubblici sia per i filtri/etichette nel pannello admin (sezione Messaggi).
export const LEAD_SOURCES = [
  "Contatti generali",
  "Richiesta gruppo",
  "Richiesta ritiro",
  "Richiesta Metodo",
  "Prenotazione lezione di prova",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];
