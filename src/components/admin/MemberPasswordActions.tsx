"use client";

import { useState } from "react";
import { KeyRound, Mail, Loader2, Check } from "lucide-react";

export default function MemberPasswordActions({ accountId }: { accountId: string }) {
  const [loading, setLoading] = useState<"set" | "link" | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSetPassword() {
    const password = window.prompt("Nuova password per questo account (minimo 8 caratteri):");
    if (!password) return;
    if (password.length < 8) {
      window.alert("La password deve avere almeno 8 caratteri.");
      return;
    }
    setLoading("set");
    try {
      const res = await fetch(`/api/admin/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) window.alert("Impossibile aggiornare la password.");
    } finally {
      setLoading(null);
    }
  }

  async function handleSendResetLink() {
    if (!window.confirm("Inviare all'utente un link via email per reimpostare la password?")) return;
    setLoading("link");
    try {
      const res = await fetch(`/api/admin/users/${accountId}/reset-link`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data.error ?? "Invio non riuscito.");
        return;
      }
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleSetPassword}
        disabled={loading !== null}
        aria-label="Imposta nuova password"
        title="Imposta nuova password"
        className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed"
      >
        {loading === "set" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={handleSendResetLink}
        disabled={loading !== null}
        aria-label="Invia link per reimpostare la password"
        title="Invia link per reimpostare la password"
        className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed"
      >
        {loading === "link" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : sent ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
