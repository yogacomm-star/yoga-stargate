import { Eye } from "lucide-react";

// Mostrata solo a un admin che apre l'indirizzo pubblico di un contenuto ancora in bozza:
// per chiunque altro quella stessa pagina risulta "non trovata" (vedi il controllo di stato
// nelle pagine di dettaglio di ritiri/corsi/blog). Fa vedere esattamente come apparirà il
// contenuto una volta pubblicato, senza doverlo pubblicare per controllare.
export default function DraftPreviewBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground">
      <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
      Anteprima bozza — solo tu la vedi così. Sul sito pubblico appare dopo la pubblicazione.
    </div>
  );
}
