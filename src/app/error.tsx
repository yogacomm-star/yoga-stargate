"use client";

import Link from "next/link";
import ErrorState, { primaryButtonClass, secondaryButtonClass } from "@/components/site/ErrorState";

// Rete di sicurezza per tutto ciò che sta fuori dal gruppo (public): area riservata, pannello
// admin, pagina di accesso al sito bloccato. Qui non c'è navbar né footer (li porta il layout
// di (public), che a questo livello non è ancora entrato in gioco), quindi i due link sotto
// sono l'unica via d'uscita: vanno lasciati.
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-background">
      <ErrorState
        eyebrow="Qualcosa è andato storto"
        title="Si è verificato un errore"
        description={
          <>
            È un problema temporaneo dalla nostra parte. Riprova fra un istante: se continua, scrivici a{" "}
            <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline">
              info@yogastargate.com
            </a>
            .
            {error.digest && (
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
    </div>
  );
}
