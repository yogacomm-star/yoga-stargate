import MarkdownContent from "@/components/site/MarkdownContent";

// Tante descrizioni scritte dall'admin (il programma di un ritiro, il contenuto di una
// lezione) sono in realtà un elenco — "- H. 9AM colazione - H. 10AM escursione - ..." — ma
// arrivano come un'unica stringa senza interruzioni di riga. Renderizzata così com'è diventa
// un muro di testo illeggibile quando il contenuto è lungo, indipendentemente da quanto sia
// ordinata la scheda che la contiene. Qui si riconosce il pattern (più occorrenze di " - ")
// e lo si trasforma in un elenco puntato vero; se il pattern non c'è, resta un paragrafo
// normale — non tocca mai il testo che l'admin ha scritto, solo come viene mostrato.
// Se il testo è stato scritto con la barra di formattazione del pannello (grassetto, corsivo,
// link, elenchi su più righe) va mostrato come tale. I vecchi testi senza formattazione restano
// gestiti come prima: un "- " dentro la stessa riga non conta come elenco.
function hasFormatting(text: string): boolean {
  if (/\*\*[^*\n]+\*\*/.test(text)) return true; // **grassetto**
  if (/(^|[\s(])\*[^*\s][^*\n]*\*/.test(text)) return true; // *corsivo*
  if (/\[[^\]\n]+\]\([^)\s]+\)/.test(text)) return true; // [testo](link)
  return text.includes("\n") && /(^|\n)\s*([-*]\s|\d+\.\s|#{1,3}\s|>\s)/.test(text);
}

export default function ScheduleText({ text, className = "" }: { text: string; className?: string }) {
  if (hasFormatting(text)) {
    return (
      <div className={className}>
        <MarkdownContent content={text} />
      </div>
    );
  }

  const parts = text
    .replace(/^-\s*/, "") // spesso il primo elemento inizia già con "- ", che altrimenti resterebbe attaccato
    .split(/\s-\s/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return <p className={className}>{text}</p>;
  }

  return (
    <ul className={`list-disc space-y-1.5 pl-4 ${className}`}>
      {parts.map((part, i) => (
        <li key={i}>{part}</li>
      ))}
    </ul>
  );
}
