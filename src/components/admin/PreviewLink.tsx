import Link from "next/link";
import { ExternalLink } from "lucide-react";

// Apre l'indirizzo pubblico reale del contenuto in una nuova scheda. Funziona anche per una
// bozza: le pagine di dettaglio di ritiri/corsi/blog lasciano vedere una bozza solo a un admin
// loggato (con un banner "Anteprima bozza" in cima), così si vede esattamente come apparirà
// prima ancora di pubblicare.
export default function PreviewLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      Anteprima
    </Link>
  );
}
