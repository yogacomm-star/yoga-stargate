"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddSaleForm() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description: description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il salvataggio.");
        return;
      }
      setAmount("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-5">
      <div>
        <label htmlFor="sale-amount" className="mb-1 block text-xs font-medium text-foreground/70">
          Importo (€)
        </label>
        <input
          id="sale-amount"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex-1 min-w-[10rem]">
        <label htmlFor="sale-description" className="mb-1 block text-xs font-medium text-foreground/70">
          Nota (facoltativa)
        </label>
        <input
          id="sale-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Es. lezione privata, ritiro pagato in contanti..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {loading ? "Salvo..." : "Aggiungi vendita"}
      </button>
      {error && <p className="w-full text-sm font-medium text-destructive">{error}</p>}
    </form>
  );
}
