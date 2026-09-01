import type { ReactNode } from "react";

// Blocco condiviso dalle pagine di errore del sito (404 e crash imprevisti), così hanno tutte
// lo stesso aspetto e lo stesso tono. Nessuna dipendenza dal server: può essere usato sia da
// componenti server (not-found.tsx) sia da componenti client (error.tsx, che devono esporre
// un pulsante "riprova" e quindi girano nel browser).
export default function ErrorState({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
      <div className="mt-4 text-base leading-relaxed text-foreground/70">{description}</div>
      {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}

// Le due varianti di pulsante usate nelle pagine di errore, allineate allo stile dei CTA del
// resto del sito.
export const primaryButtonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5";

export const secondaryButtonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-border bg-card px-7 py-3 text-base font-semibold text-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5";
