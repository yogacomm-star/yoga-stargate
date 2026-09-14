"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SiteLockToggle({ initialLocked }: { initialLocked: boolean }) {
  const [locked, setLocked] = useState(initialLocked);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    const confirmMessage = locked
      ? "Sbloccare il sito? Tornerà visibile a chiunque."
      : "Bloccare il sito? Solo chi ha effettuato l'accesso come admin potrà vederlo: tutti gli altri vedranno la pagina \"in costruzione\".";
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: locked ? "unlock" : "lock" }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLocked(data.locked);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {locked ? (
          <>
            <Lock className="h-4 w-4 text-destructive" aria-hidden="true" />
            Sito in costruzione per i visitatori
          </>
        ) : (
          <>
            <LockOpen className="h-4 w-4 text-foreground/50" aria-hidden="true" />
            Sito visibile a tutti
          </>
        )}
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          locked
            ? "border border-border text-foreground hover:bg-foreground/5"
            : "bg-primary text-primary-foreground hover:-translate-y-0.5"
        }`}
      >
        {locked ? "Sblocca il sito" : "Blocca il sito"}
      </button>
    </div>
  );
}
