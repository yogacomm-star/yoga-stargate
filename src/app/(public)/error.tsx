"use client";

import Link from "next/link";
import ErrorState, { primaryButtonClass, secondaryButtonClass } from "@/components/site/ErrorState";

// Rete di sicurezza per le pagine pubbliche: se una pagina va in errore (database irraggiungibile,
// eccezione imprevista) il visitatore vede questo invece della schermata di errore di Next, in
// inglese e fuori dallo stile del sito. Sta dentro il gruppo (public), quindi navbar e footer
// restano al loro posto. Deve essere un componente client: espone il pulsante "riprova".
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      eyebrow="Qualcosa è andato storto"
      title="Non riusciamo a caricare questa pagina"
      description={
        <>
          È un problema temporaneo dalla nostra parte. Riprova fra un istante: se continua, scrivici a{" "}
          <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline">
            info@yogastargate.com
          </a>
          .
          {error.digest && (
            // Codice tecnico dell'errore: inutile per il visitatore, ma è ciò che permette di
            // ritrovare l'errore preciso nei log quando qualcuno lo segnala.
            <span className="mt-3 block text-xs text-foreground/40">Codice errore: {error.digest}</span>
          )}
        </>
      }
    >
      <button type="button" onClick={reset} className={primaryButtonClass}>
        Riprova
      </button>
      <Link href="/" className={secondaryButtonClass}>
        Torna alla home
      </Link>
    </ErrorState>
  );
}
