"use client";

import { useState } from "react";

// Interruttore per il consenso alle email promozionali: chi lo ha dato può ritirarlo in ogni
// momento (e chi non lo aveva dato può attivarlo) senza scrivere a nessuno.
export default function MarketingConsentToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !enabled;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingConsent: next }),
      });
      if (!res.ok) throw new Error();
      setEnabled(next);
    } catch {
      setError("Non è stato possibile salvare la scelta, riprova.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Email con novità e inviti</p>
        <p className="mt-1 text-sm text-foreground/60">
          {enabled
            ? "Ricevi via email pratiche, novità su corsi, eventi e ritiri. Puoi disattivarle in qualsiasi momento."
            : "Non ricevi email promozionali. Se vuoi restare aggiornata/o, attivale qui."}{" "}
          I messaggi di servizio (acquisti, prenotazioni, password) arrivano comunque.
        </p>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Email con novità e inviti"
        onClick={toggle}
        disabled={saving}
        className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          enabled ? "bg-primary" : "bg-foreground/20"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
