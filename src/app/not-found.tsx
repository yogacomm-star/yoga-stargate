import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import ErrorState, { primaryButtonClass, secondaryButtonClass } from "@/components/site/ErrorState";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: false },
};

// 404 per gli indirizzi che non corrispondono a nessuna rotta del sito. A differenza di
// (public)/not-found.tsx questa non sta dentro il gruppo (public), quindi navbar e footer
// vanno aggiunti qui a mano con SiteShell: senza, il visitatore si troverebbe in una pagina
// senza alcun modo di tornare al sito.
export default function NotFound() {
  return (
    <SiteShell>
      <ErrorState
        eyebrow="Errore 404"
        title="Questa pagina non c'è"
        description={
          <>
            L&apos;indirizzo che hai aperto non esiste (o non esiste più). Puoi tornare alla home o cercare
            quello che ti serve fra ritiri, corsi e articoli.
          </>
        }
      >
        <Link href="/" className={primaryButtonClass}>
          Torna alla home
        </Link>
        <Link href="/cerca" className={secondaryButtonClass}>
          Cerca nel sito
        </Link>
      </ErrorState>
    </SiteShell>
  );
}
