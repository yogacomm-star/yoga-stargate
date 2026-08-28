"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import type { LeadSource } from "@/lib/leadSources";

export default function LeadForm({
  retreatId,
  defaultMessage = "",
  submitLabel = "Invia richiesta",
  showGroupSize = false,
  source = "Contatti generali",
}: {
  retreatId?: string;
  defaultMessage?: string;
  submitLabel?: string;
  showGroupSize?: boolean;
  /** Provenienza del messaggio, per dividerlo per categoria nel pannello admin (sezione Messaggi). */
  source?: LeadSource;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: defaultMessage, groupSize: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          retreatId,
          source,
          groupSize: form.groupSize ? Number(form.groupSize) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setForm({ name: "", email: "", phone: "", message: "", groupSize: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-warm-surface/60 p-6 text-center"
      >
        <p className="font-heading text-lg font-semibold text-foreground">Richiesta inviata!</p>
        <p className="mt-2 text-sm text-foreground/70">Ti risponderemo il prima possibile via email.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-foreground">
            Nome e cognome
          </label>
          <input
            id="lead-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div>
        <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium text-foreground">
          Telefono (facoltativo)
        </label>
        <input
          id="lead-phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {showGroupSize && (
        <div>
          <label htmlFor="lead-group-size" className="mb-1 block text-sm font-medium text-foreground">
            Quante persone siete? (facoltativo)
          </label>
          <input
            id="lead-group-size"
            type="number"
            min={2}
            max={500}
            value={form.groupSize}
            onChange={(e) => setForm((f) => ({ ...f, groupSize: e.target.value }))}
            placeholder="Es. 15"
            className="w-full max-w-[10rem] rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
      <div>
        <label htmlFor="lead-message" className="mb-1 block text-sm font-medium text-foreground">
          Messaggio
        </label>
        <textarea
          id="lead-message"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Invio..." : submitLabel}
      </button>
      {status === "error" && (
        <p className="text-sm font-medium text-destructive">Qualcosa è andato storto, riprova tra poco.</p>
      )}
    </form>
  );
}
