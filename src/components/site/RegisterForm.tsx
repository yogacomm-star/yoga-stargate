"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Devi accettare i termini per registrarti.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, marketingConsent: consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante la registrazione.");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reg-name" className="mb-1 block text-sm font-medium text-foreground">
          Nome e cognome
        </label>
        <input
          id="reg-name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="reg-phone" className="mb-1 block text-sm font-medium text-foreground">
          Telefono
        </label>
        <input
          id="reg-phone"
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+39 333 1234567"
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-foreground/50">Almeno 8 caratteri.</p>
      </div>
      <label className="flex items-start gap-2 text-xs text-foreground/60">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 cursor-pointer"
        />
        Accetto i{" "}
        <Link href="/privacy" className="cursor-pointer font-semibold text-primary">
          Termini e la Privacy Policy
        </Link>
        , e autorizzo Yoga Stargate a inviarmi comunicazioni via email su corsi, ritiri e novità.
      </label>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creazione account..." : "Crea account"}
      </button>
    </form>
  );
}
