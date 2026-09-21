"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Bold, Italic, Heading2, List, ListOrdered, Quote, Link2, Eye, Pencil } from "lucide-react";
import MarkdownContent from "@/components/site/MarkdownContent";

// Campo di testo con barra di formattazione: chi scrive seleziona una parola e preme Grassetto,
// Corsivo, ecc. senza dover conoscere i simboli Markdown (**testo**, *testo*) che il sito già
// interpreta. "Anteprima" mostra il testo come apparirà nella pagina.
export default function RichTextField({
  value,
  onChange,
  rows = 6,
  required = false,
  id,
  ariaLabel,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  required?: boolean;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  function apply(next: string, selStart: number, selEnd: number) {
    onChange(next);
    // Dopo il re-render rimette il cursore/la selezione dove serve.
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  // Racchiude la selezione (o una parola segnaposto) tra due simboli, es. **grassetto**.
  // Se è già racchiusa, toglie i simboli: un secondo clic annulla la formattazione.
  function wrap(mark: string, placeholderText: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e);
    const before = value.slice(0, s);
    const after = value.slice(e);

    if (selected && before.endsWith(mark) && after.startsWith(mark)) {
      apply(before.slice(0, -mark.length) + selected + after.slice(mark.length), s - mark.length, e - mark.length);
      return;
    }
    const inner = selected || placeholderText;
    apply(`${before}${mark}${inner}${mark}${after}`, s + mark.length, s + mark.length + inner.length);
  }

  // Mette un simbolo all'inizio di ogni riga selezionata (elenco, citazione, titolo).
  function prefixLines(makePrefix: (i: number) => string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const lineEndIdx = value.indexOf("\n", e);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const block = value.slice(lineStart, lineEnd) || "Testo";
    const changed = block
      .split("\n")
      .map((line, i) => `${makePrefix(i)}${line}`)
      .join("\n");
    apply(value.slice(0, lineStart) + changed + value.slice(lineEnd), lineStart, lineStart + changed.length);
  }

  function link() {
    const el = ref.current;
    if (!el) return;
    const url = window.prompt("Indirizzo del link (es. https://www.yogastargate.com):", "https://");
    if (!url || url === "https://") return;
    const { selectionStart: s, selectionEnd: e } = el;
    const text = value.slice(s, e) || "testo del link";
    const md = `[${text}](${url.trim()})`;
    apply(value.slice(0, s) + md + value.slice(e), s, s + md.length);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "b") {
      e.preventDefault();
      wrap("**", "grassetto");
    } else if (e.key === "i") {
      e.preventDefault();
      wrap("*", "corsivo");
    }
  }

  const tool =
    "flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-foreground/70 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="rounded-lg border border-border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1">
        <button type="button" className={tool} onClick={() => wrap("**", "grassetto")} disabled={preview} title="Grassetto (Ctrl/Cmd + B)" aria-label="Grassetto">
          <Bold className="h-4 w-4" /> <span className="hidden sm:inline">Grassetto</span>
        </button>
        <button type="button" className={tool} onClick={() => wrap("*", "corsivo")} disabled={preview} title="Corsivo (Ctrl/Cmd + I)" aria-label="Corsivo">
          <Italic className="h-4 w-4" /> <span className="hidden sm:inline">Corsivo</span>
        </button>
        <button type="button" className={tool} onClick={() => prefixLines(() => "### ")} disabled={preview} title="Sottotitolo" aria-label="Sottotitolo">
          <Heading2 className="h-4 w-4" /> <span className="hidden sm:inline">Sottotitolo</span>
        </button>
        <button type="button" className={tool} onClick={() => prefixLines(() => "- ")} disabled={preview} title="Elenco puntato" aria-label="Elenco puntato">
          <List className="h-4 w-4" /> <span className="hidden sm:inline">Elenco</span>
        </button>
        <button type="button" className={tool} onClick={() => prefixLines((i) => `${i + 1}. `)} disabled={preview} title="Elenco numerato" aria-label="Elenco numerato">
          <ListOrdered className="h-4 w-4" /> <span className="hidden sm:inline">Numerato</span>
        </button>
        <button type="button" className={tool} onClick={() => prefixLines(() => "> ")} disabled={preview} title="Citazione" aria-label="Citazione">
          <Quote className="h-4 w-4" /> <span className="hidden sm:inline">Citazione</span>
        </button>
        <button type="button" className={tool} onClick={link} disabled={preview} title="Link" aria-label="Link">
          <Link2 className="h-4 w-4" /> <span className="hidden sm:inline">Link</span>
        </button>
        <button
          type="button"
          className={`${tool} ml-auto ${preview ? "bg-primary/10 text-primary" : ""}`}
          onClick={() => setPreview((v) => !v)}
          aria-pressed={preview}
        >
          {preview ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {preview ? "Torna a scrivere" : "Anteprima"}
        </button>
      </div>

      {preview ? (
        <div className="min-h-24 px-3.5 py-3">
          {value.trim() ? <MarkdownContent content={value} /> : <p className="text-sm text-foreground/50">Niente da mostrare.</p>}
        </div>
      ) : (
        <textarea
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          required={required}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full resize-y rounded-b-lg bg-transparent px-3.5 py-2.5 text-sm outline-none"
        />
      )}
    </div>
  );
}
