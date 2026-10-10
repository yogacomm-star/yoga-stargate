// Categorie con cui si classificano gli eventi dal pannello admin. Le prime quattro sono i
// filtri fissi della pagina Eventi (nell'ordine voluto dalla cliente); "Sessione individuale" ed
// "Extra" compaiono come filtro solo quando esiste almeno un evento così.
// Gli eventi "Extra" (e le sessioni individuali) non vengono mai proposti nella home: restano
// visibili nella pagina Eventi e raggiungibili dal loro indirizzo.
export const EVENT_CATEGORIES = ["Masterclass", "Workshop", "Retreat", "Viaggi"] as const;
export const EXTRA_EVENT_CATEGORIES = ["Sessione individuale", "Extra"] as const;

/** Categorie che la home non deve mai proporre in automatico. */
export const HIDDEN_FROM_HOME = ["Masterclass", "Workshop", "Sessione individuale", "Extra"] as const;
export const ALL_EVENT_CATEGORIES = [...EVENT_CATEGORIES, ...EXTRA_EVENT_CATEGORIES] as const;
