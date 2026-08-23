"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function AiDraftButton({
  kind,
  field,
  title,
  category,
  location,
  notes,
  onGenerated,
}: {
  kind: "retreat" | "course" | "post";
  field: "excerpt" | "description" | "content";
  title: string;
  category?: string;
  location?: string;
  notes?: string;
  onGenerated: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!title.trim()) {
      setError("Scrivi prima un titolo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, field, title, category, location, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante la generazione.");
        return;
      }
      onGenerated(data.text);
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        Genera con AI
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
