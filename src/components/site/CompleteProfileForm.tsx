"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";

export default function CompleteProfileForm() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il salvataggio.");
        setStatus("error");
        return;
      }
      router.refresh();
    } catch {
      setError("Errore di rete, riprova.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 text-primary">
        <Phone className="h-4 w-4" aria-hidden="true" />
        <p className="font-heading text-sm font-semibold">Completa il tuo profilo</p>
      </div>
      <p className="mt-1 text-sm text-foreground/70">Aggiungi il tuo numero di telefono per completare la registrazione.</p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+39 333 1234567"
          className="flex-1 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {status === "loading" ? "Salvataggio..." : "Salva"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
