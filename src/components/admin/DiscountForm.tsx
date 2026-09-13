"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function DiscountForm() {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type,
          value: Number(value),
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il salvataggio.");
        return;
      }
      setCode("");
      setValue("");
      setMaxRedemptions("");
      setExpiresAt("");
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
        <label htmlFor="discount-code" className="mb-1 block text-xs font-medium text-foreground/70">
          Codice
        </label>
        <input
          id="discount-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Es. BENVENUTO10"
          required
          className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="discount-type" className="mb-1 block text-xs font-medium text-foreground/70">
          Tipo
        </label>
        <select
          id="discount-type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="percent">Percentuale (%)</option>
          <option value="amount">Importo fisso (€)</option>
        </select>
      </div>
      <div>
        <label htmlFor="discount-value" className="mb-1 block text-xs font-medium text-foreground/70">
          Valore
        </label>
        <input
          id="discount-value"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === "percent" ? "Es. 10" : "Es. 5.00"}
          className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="discount-max" className="mb-1 block text-xs font-medium text-foreground/70">
          Usi max (facolt.)
        </label>
        <input
          id="discount-max"
          type="number"
          min={1}
          step="1"
          value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)}
          placeholder="illimitati"
          className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="discount-expires" className="mb-1 block text-xs font-medium text-foreground/70">
          Scadenza (facolt.)
        </label>
        <input
          id="discount-expires"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {loading ? "Creo..." : "Crea codice"}
      </button>
      {error && <p className="w-full text-sm font-medium text-destructive">{error}</p>}
    </form>
  );
}
