"use client";

import { useState } from "react";
import { Lock, LockOpen, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SiteLockToggle({ initialLocked }: { initialLocked: boolean }) {
  const [locked, setLocked] = useState(initialLocked);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function callApi(action: "lock" | "unlock") {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLocked(data.locked);
      setCode(data.code ?? null);
      setCopied(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock() {
    const ok = window.confirm("Sbloccare il sito? Tornerà visibile a chiunque, senza codice.");
    if (!ok) return;
    await callApi("unlock");
  }

  async function handleGenerate() {
    if (locked) {
      const ok = window.confirm("Generare un nuovo codice? Quello attuale smetterà subito di funzionare.");
      if (!ok) return;
    }
    await callApi("lock");
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard non disponibile: l'utente può comunque selezionare e copiare il testo a mano
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {locked ? (
            <>
              <Lock className="h-4 w-4 text-destructive" aria-hidden="true" />
              Sito bloccato
            </>
          ) : (
            <>
              <LockOpen className="h-4 w-4 text-foreground/50" aria-hidden="true" />
              Sito accessibile a tutti
            </>
          )}
        </div>
        {locked && (
          <button
            type="button"
            onClick={handleUnlock}
            disabled={loading}
            className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sblocca il sito
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {locked ? "Genera un nuovo codice" : "Blocca il sito con un codice"}
      </button>

      {code && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-foreground/70">
            Codice di accesso — salvalo o condividilo ora: non verrà mostrato di nuovo.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="font-mono text-xl font-bold tracking-widest text-foreground">{code}</span>
            <button
              type="button"
              onClick={copyCode}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/5"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? "Copiato" : "Copia"}
            </button>
          </div>
        </div>
      )}

      {locked && !code && (
        <p className="text-xs text-foreground/60">
          Il codice attivo non è recuperabile: se lo hai perso, genera un nuovo codice qui sopra.
        </p>
      )}
    </div>
  );
}
