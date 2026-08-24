"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function GenerateFullDraftButton<T>({
  kind,
  onGenerated,
}: {
  kind: "retreat" | "course" | "post";
  onGenerated: (draft: T) => void;
}) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) {
      setError("Scrivi prima un argomento o un titolo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante la generazione.");
        return;
      }
      onGenerated(data as T);
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Genera tutto con AI</p>
      </div>
      <p className="mt-1 text-xs text-foreground/60">
        Scrivi un argomento o un&apos;idea: l&apos;AI compila l&apos;intero modulo qui sotto, che puoi poi rivedere e
        modificare liberamente prima di salvare.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              generate();
            }
          }}
          placeholder="Es. Ritiro di 3 giorni sul respiro in Toscana"
          aria-label="Argomento da sviluppare con l'AI"
          className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Genero..." : "Genera tutto"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
