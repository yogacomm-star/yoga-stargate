// I testi lunghi scritti dal pannello admin (programma di un ritiro, dettagli di un corso)
// spesso alternano una riga-etichetta breve ("Cosa portare:", "Quota e prenotazione",
// "Location") seguita dal contenuto vero e proprio, ma senza una vera intestazione
// Markdown (## ...). Renderizzati come semplice testo, sembrano un unico muro di paragrafi
// indistinguibili. Qui si individuano quelle righe-etichetta e si usano per dividere il
// testo in sezioni, cosa che permette di mostrarle come schede visivamente separate.
export type Section = { heading: string | null; body: string };

const MAX_HEADING_LENGTH = 60;
const SENTENCE_END = /[.!?…]\s*$/;

function looksLikeHeading(firstLine: string, hasBodyAfter: boolean): boolean {
  const trimmed = firstLine.trim();
  if (!trimmed || trimmed.length > MAX_HEADING_LENGTH) return false;
  if (SENTENCE_END.test(trimmed)) return false;
  if (/^[-*•]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) return false;
  return hasBodyAfter;
}

export function splitIntoSections(raw: string): Section[] {
  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const sections: Section[] = [{ heading: null, body: "" }];

  blocks.forEach((block, i) => {
    const newlineIndex = block.indexOf("\n");
    const firstLine = newlineIndex === -1 ? block : block.slice(0, newlineIndex);
    const rest = newlineIndex === -1 ? "" : block.slice(newlineIndex + 1).trim();
    const hasBodyAfter = rest.length > 0 || i < blocks.length - 1;

    if (looksLikeHeading(firstLine, hasBodyAfter)) {
      sections.push({ heading: firstLine.trim(), body: rest });
    } else {
      const current = sections[sections.length - 1];
      current.body = current.body ? `${current.body}\n\n${block}` : block;
    }
  });

  return sections.filter((s) => s.heading || s.body);
}
