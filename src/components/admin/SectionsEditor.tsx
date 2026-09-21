"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import type { Section } from "@/lib/sectionize";
import RichTextField from "@/components/admin/RichTextField";

// Editor a "riquadri": ogni riquadro ha un titolo scelto da chi scrive (es. "A chi è rivolto",
// "Programma", "Cosa vivi") e un testo. Sul sito diventano schede separate, come nella pagina
// Metodo. Un riquadro senza titolo è un semplice paragrafo introduttivo, senza cornice.
export default function SectionsEditor({
  sections,
  onChange,
}: {
  sections: Section[];
  onChange: (next: Section[]) => void;
}) {
  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  function update(index: number, patch: Partial<Section>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {sections.length === 0 && (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-foreground/60">
          Ancora nessun riquadro. Aggiungine uno: scegli tu il titolo (per esempio “A chi è rivolto”, “Programma”,
          “Cosa impari”, “Quota e prenotazione”).
        </p>
      )}

      {sections.map((section, i) => (
        <div key={i} className="rounded-xl border border-border bg-background/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <input
              aria-label={`Titolo del riquadro ${i + 1}`}
              placeholder={section.heading === null ? "Titolo (lascia vuoto per un paragrafo senza cornice)" : "Titolo del riquadro"}
              value={section.heading ?? ""}
              onChange={(e) => update(i, { heading: e.target.value })}
              className={inputClass + " font-semibold"}
            />
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Sposta il riquadro in su"
                className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === sections.length - 1}
                aria-label="Sposta il riquadro in giù"
                className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(sections.filter((_, idx) => idx !== i))}
                aria-label="Elimina il riquadro"
                className="cursor-pointer rounded-lg p-2 text-foreground/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <RichTextField
            ariaLabel={`Testo del riquadro ${i + 1}`}
            placeholder="Testo del riquadro. Seleziona le parole e usa i pulsanti sopra per grassetto, corsivo, elenchi."
            rows={5}
            value={section.body}
            onChange={(text) => update(i, { body: text })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...sections, { heading: "", body: "" }])}
        className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary"
      >
        <Plus className="h-4 w-4" /> Aggiungi riquadro
      </button>
    </div>
  );
}
