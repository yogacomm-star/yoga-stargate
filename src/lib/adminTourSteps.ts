export type TourStep = {
  href: string;
  target?: string;
  title: string;
  description: string;
};

export const adminTourSteps: TourStep[] = [
  {
    href: "/admin",
    title: "Benvenuta/o nel pannello Yoga Stargate",
    description:
      "In pochi passaggi ti mostriamo come gestire il sito e cosa possono fare le persone che lo visitano. Puoi uscire quando vuoi e riaprire questa guida dal pulsante \"Guida\".",
  },
  {
    href: "/admin",
    target: "admin-stats",
    title: "Dashboard",
    description: "Qui trovi il riepilogo di ritiri, corsi, articoli, membri, richieste ricevute e recensioni in attesa.",
  },
  {
    href: "/admin",
    target: "admin-reviews",
    title: "Recensioni da moderare",
    description:
      "Le recensioni lasciate dai membri compaiono prima qui: puoi approvarle (diventano visibili sul sito) o rifiutarle. Se ora non ce ne sono, questa sezione resta semplicemente vuota.",
  },
  {
    href: "/admin/ritiri",
    target: "admin-nav-ritiri",
    title: "Sezione Ritiri",
    description: "Da qui gestisci tutti i ritiri: titolo, categoria, date, prezzo, livello richiesto e stato (bozza o pubblicato).",
  },
  {
    href: "/admin/ritiri",
    target: "admin-new-retreat",
    title: "Crea un nuovo ritiro",
    description:
      "Con questo pulsante crei un nuovo ritiro: puoi caricare un'immagine di copertina, costruire il programma giorno per giorno e decidere se è aperto a tutti o riservato a un livello.",
  },
  {
    href: "/admin/corsi",
    target: "admin-nav-corsi",
    title: "Sezione Corsi",
    description: "I corsi sono percorsi in video e testo, organizzati in lezioni. Anche qui puoi decidere il livello richiesto.",
  },
  {
    href: "/admin/corsi",
    target: "admin-new-course",
    title: "Crea un nuovo corso",
    description: "Aggiungi lezioni una per una: titolo, un eventuale video incorporato e il testo della lezione.",
  },
  {
    href: "/admin/blog",
    target: "admin-nav-blog",
    title: "Sezione Blog",
    description: "Gestisci gli articoli del blog: categoria, estratto, contenuto (con supporto markdown) e stato di pubblicazione.",
  },
  {
    href: "/admin/blog",
    target: "admin-new-post",
    title: "Nuovo articolo",
    description: "Il tempo di lettura viene calcolato automaticamente in base alla lunghezza del testo.",
  },
  {
    href: "/admin/utenti",
    target: "admin-nav-utenti",
    title: "Sezione Utenti",
    description: "Qui trovi tutti i membri registrati sul sito.",
  },
  {
    href: "/admin/utenti",
    target: "admin-members",
    title: "Gestione dei livelli",
    description:
      "Ogni membro parte dal livello Base. Da qui puoi farlo salire a Intermedio o Avanzato: determina quali ritiri e corsi riservati può sbloccare.",
  },
  {
    href: "/admin/utenti",
    target: "admin-members",
    title: "Account: crea, elimina, reimposta password",
    description:
      "Con \"Crea nuovo account\" registri un membro manualmente. Su ogni riga puoi impostare subito una nuova password (icona chiave), inviare all'utente un'email con un link per reimpostarla da solo (icona busta), eliminare l'account (icona cestino) e vedere se ha dato il consenso a ricevere email.",
  },
  {
    href: "/admin/messaggi",
    target: "admin-nav-messaggi",
    title: "Sezione Messaggi",
    description:
      "Tutte le richieste ricevute dal sito arrivano qui, già divise per categoria (contatti generali, gruppo, ritiro, Metodo, lezione di prova): scegli una categoria per filtrare, o esporta tutto in CSV.",
  },
  {
    href: "/admin",
    target: "admin-nav-dashboard",
    title: "Torna sempre qui",
    description: "La dashboard è il punto di partenza: da qui raggiungi in un clic tutte le sezioni che abbiamo visto.",
  },
  {
    href: "/admin",
    title: "Livelli sul sito pubblico",
    description:
      "Chi si registra sul sito parte dal livello Base. Alcuni ritiri e corsi sono aperti a tutti, altri richiedono un livello più alto: chi non lo ha ancora vede un avviso con invito a contattarti.",
  },
  {
    href: "/admin",
    title: "Preferiti e progressi",
    description:
      "I membri possono salvare ritiri e corsi tra i preferiti e segnare i corsi come completati: tutto è visibile nella loro area personale.",
  },
  {
    href: "/admin",
    title: "Recensioni, ricerca ed email",
    description:
      "Il sito pubblico ha una ricerca globale su ritiri, corsi e blog e un calendario scaricabile per le lezioni settimanali di Milano. Chi si registra dà il consenso a ricevere email su corsi, ritiri e novità: da qui puoi scrivergli con la sezione Email.",
  },
  {
    href: "/admin",
    title: "Hai finito il giro guidato!",
    description: "Puoi riaprire questa guida in qualsiasi momento dal pulsante \"Guida\" in basso a destra. Buon lavoro!",
  },
];
