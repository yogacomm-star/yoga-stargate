// Provenienze possibili per un ContactLead: usate sia per validare l'input dei form
// pubblici sia per i filtri/etichette nel pannello admin (sezione Messaggi).
export const LEAD_SOURCES = [
  "Contatti generali",
  "Richiesta gruppo",
  "Richiesta Percorsi Live",
  "Richiesta ritiro",
  "Richiesta evento",
  "Prenotazione evento",
  "Richiesta Metodo",
  // Non più generabile (il checkout della lezione di prova è stato ritirato): resta nell'elenco
  // solo per continuare a filtrare correttamente le richieste storiche già ricevute con questa
  // provenienza.
  "Prenotazione lezione di prova",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];
