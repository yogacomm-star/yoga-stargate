"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function TrialLessonButton({ label = "Prenota e paga la lezione di prova — 20€" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function book() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lezione-prova/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Impossibile avviare il pagamento.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Impossibile avviare il pagamento.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={book}
        disabled={loading}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-soft-md transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Un attimo..." : label}
        {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
