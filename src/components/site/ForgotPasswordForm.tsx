"use client";

import { useState, type FormEvent } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Qualcosa è andato storto, riprova.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Errore di rete, riprova.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/80">
        Se l&apos;indirizzo è registrato, ti abbiamo appena mandato un&apos;email con il link per scegliere una nuova
        password. Controlla anche la cartella spam.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Invio in corso..." : "Inviami il link"}
      </button>
    </form>
  );
}
