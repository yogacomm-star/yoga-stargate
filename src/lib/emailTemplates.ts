export type EmailTemplateKey = "nuovo_ritiro" | "nuovo_corso" | "promemoria_lezione" | "promozione" | "newsletter";

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, { label: string; subject: string; message: string }> = {
  nuovo_ritiro: {
    label: "Nuovo ritiro disponibile",
    subject: "Un nuovo ritiro ti aspetta",
    message:
      "Ciao,\n\nè appena arrivato un nuovo ritiro che potrebbe interessarti: [nome del ritiro], a [luogo], dal [data inizio] al [data fine].\n\n[Racconta qui in due o tre frasi cosa rende speciale questa esperienza.]\n\nTrovi tutti i dettagli e il programma completo sul sito, nella sezione Ritiri.\n\nA presto,\nTina",
  },
  nuovo_corso: {
    label: "Nuovo corso disponibile",
    subject: "Nuovo corso online: [nome del corso]",
    message:
      "Ciao,\n\nda oggi è disponibile un nuovo corso online: [nome del corso].\n\n[Racconta qui in breve il percorso e a chi è rivolto.]\n\nPuoi iniziare subito dalla sezione Corsi del sito.\n\nA presto,\nTina",
  },
  promemoria_lezione: {
    label: "Promemoria Percorsi Live",
    subject: "Ci vediamo mercoledì allo Spazio Olistico Pachamama",
    message:
      "Ciao,\n\nun piccolo promemoria per [nome dell'appuntamento: Masterclass/Workshop/Percorso individuale] di mercoledì [data] alle [orario], allo Spazio Olistico Pachamama a Milano.\n\nI posti sono limitati: se non riesci a venire o vuoi informazioni su un altro Percorso Live, scrivimi pure.\n\nA presto,\nTina",
  },
  promozione: {
    label: "Promozione / sconto",
    subject: "Un'offerta speciale per te",
    message:
      "Ciao,\n\nper un periodo limitato, [descrivi qui l'offerta: ad esempio uno sconto su un ritiro o un corso].\n\nValida fino al [data]. Scrivimi se vuoi maggiori informazioni o per prenotare.\n\nA presto,\nTina",
  },
  newsletter: {
    label: "Aggiornamenti / newsletter",
    subject: "Novità da Yoga Stargate",
    message:
      "Ciao,\n\necco qualche novità dal mondo di Yoga Stargate:\n\n[Racconta qui le novità: nuovi contenuti, prossimi eventi, riflessioni del periodo.]\n\nA presto,\nTina",
  },
};
