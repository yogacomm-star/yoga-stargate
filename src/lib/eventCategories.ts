// Categorie con cui si classificano gli eventi dal pannello admin. Le prime quattro sono i
// filtri fissi della pagina Eventi (nell'ordine voluto dalla cliente); "Sessione individuale"
// è offerta per completezza ma compare come filtro solo quando esiste almeno un evento così.
export const EVENT_CATEGORIES = ["Masterclass", "Workshop", "Retreat", "Viaggi"] as const;
export const EXTRA_EVENT_CATEGORIES = ["Sessione individuale"] as const;
export const ALL_EVENT_CATEGORIES = [...EVENT_CATEGORIES, ...EXTRA_EVENT_CATEGORIES] as const;
