"use client";

import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";

export default function SiteAccessForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/site-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Codice errato.");
        setLoading(false);
        return;
      }
      window.location.href = redirectTo;
    } catch {
      setError("Errore di rete, riprova.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="site-code" className="mb-1 block text-sm font-medium text-foreground">
          Codice di accesso
        </label>
        <input
          id="site-code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {loading ? "Verifica..." : "Entra"}
      </button>
      {error && <p className="text-center text-sm font-medium text-destructive">{error}</p>}
    </form>
  );
}
