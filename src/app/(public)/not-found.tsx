import type { Metadata } from "next";
import Link from "next/link";
import ErrorState, { primaryButtonClass, secondaryButtonClass } from "@/components/site/ErrorState";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: false },
};

// Mostrata quando una pagina pubblica chiama notFound() (un ritiro, un corso o un articolo
// che non esiste più o non è ancora pubblicato). Navbar e footer arrivano dal layout del
// gruppo (public), quindi qui basta il contenuto.
export default function PublicNotFound() {
  return (
    <ErrorState
      eyebrow="Errore 404"
      title="Questa pagina non c'è"
      description={
        <>
          Forse il link è vecchio, oppure il contenuto che cercavi non è più online. Puoi tornare alla home o
          dare un&apos;occhiata a ritiri, corsi e articoli.
        </>
      }
    >
      <Link href="/" className={primaryButtonClass}>
        Torna alla home
      </Link>
      <Link href="/ritiri" className={secondaryButtonClass}>
        Vedi i ritiri
      </Link>
      <Link href="/corsi" className={secondaryButtonClass}>
        Vedi i corsi
      </Link>
    </ErrorState>
  );
}
