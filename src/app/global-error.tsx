"use client";

import "./globals.css";

// Ultimo livello di difesa: si attiva solo quando l'errore avviene nel layout radice stesso,
// dove nemmeno error.tsx viene renderizzato. Sostituisce l'intero documento, quindi deve
// dichiarare <html> e <body> per conto suo e non può contare su nulla del resto del sito —
// per questo qui non si importano componenti condivisi e i font sono quelli di sistema.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Errore</p>
          <h1 className="mt-3 text-3xl font-semibold">Il sito non è raggiungibile</h1>
          <p className="mt-4 text-base leading-relaxed text-foreground/70">
            Si è verificato un problema imprevisto. Riprova fra un istante: se continua, scrivici a{" "}
            <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline">
              info@yogastargate.com
            </a>
            .
          </p>
          {error.digest && <p className="mt-3 text-xs text-foreground/40">Codice errore: {error.digest}</p>}
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  );
}
