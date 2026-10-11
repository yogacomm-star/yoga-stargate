"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";

// Duplica un evento: la copia nasce come bozza e si apre subito per cambiare data e orario.
export default function DuplicateEventButton({
  eventId,
  variant = "icon",
}: {
  eventId: string;
  variant?: "icon" | "text";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function duplicate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/retreats/${eventId}/duplicate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        setError(data.error ?? "Impossibile duplicare l'evento.");
        return;
      }
      router.push(`/admin/ritiri/${data.id}`);
      router.refresh();
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "text") {
    return (
      <span className="flex flex-col items-end">
        <button
          type="button"
          onClick={duplicate}
          disabled={loading}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
          Duplica evento
        </button>
        {error && <span className="text-xs font-medium text-destructive">{error}</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={duplicate}
      disabled={loading}
      aria-label="Duplica"
      title={error ?? "Duplica (crea una copia come bozza)"}
      className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-primary disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
