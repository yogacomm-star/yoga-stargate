import Link from "next/link";

// Mostrata quando dal pannello si apre un contenuto che non esiste più (es. un ritiro appena
// eliminato, o un link vecchio con un id non più valido). Sta dentro il gruppo (dashboard),
// quindi la barra laterale dell'admin resta al suo posto.
export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">Errore 404</p>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-foreground">Contenuto non trovato</h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
        Il contenuto che stai cercando non esiste più: probabilmente è stato eliminato, oppure hai aperto un
        link non più valido.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
      >
        Torna al pannello
      </Link>
    </div>
  );
}
