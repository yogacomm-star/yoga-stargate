"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export default function BroadcastForm({ emailConfigured }: { emailConfigured: boolean }) {
  const [audience, setAudience] = useState<"newsletter" | "members" | "all">("newsletter");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ total: number; sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm("Confermi l'invio di questa email? L'azione non può essere annullata.")) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'invio.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
      setSubject("");
      setMessage("");
    } catch {
      setError("Errore di rete, riprova.");
      setStatus("error");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
      {!emailConfigured && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Invio email non ancora configurato: aggiungi <code className="font-mono">RESEND_API_KEY</code> nelle
          variabili d&apos;ambiente per attivarlo. Puoi comunque preparare il messaggio.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="broadcast-audience" className="mb-1 block text-sm font-medium text-foreground">
            Destinatari
          </label>
          <select
            id="broadcast-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as typeof audience)}
            className={inputClass}
          >
            <option value="newsletter">Iscritti alla newsletter</option>
            <option value="members">Membri registrati</option>
            <option value="all">Tutti (newsletter + membri)</option>
          </select>
        </div>
        <div>
          <label htmlFor="broadcast-subject" className="mb-1 block text-sm font-medium text-foreground">
            Oggetto
          </label>
          <input
            id="broadcast-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="broadcast-message" className="mb-1 block text-sm font-medium text-foreground">
            Messaggio
          </label>
          <textarea
            id="broadcast-message"
            required
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Scrivi qui il testo dell'email. Lascia una riga vuota per andare a capo con un nuovo paragrafo."
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        {result && (
          <p className="text-sm font-medium text-primary">
            Inviata a {result.sent} destinatari su {result.total}
            {result.failed > 0 ? ` (${result.failed} falliti)` : ""}.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {status === "loading" ? "Invio in corso..." : "Invia email"}
        </button>
      </form>
    </div>
  );
}
