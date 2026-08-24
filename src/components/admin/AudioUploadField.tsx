"use client";

import { useState, type ChangeEvent } from "react";
import { Music, X, Loader2 } from "lucide-react";

export default function AudioUploadField({
  audioUrl,
  audioKey,
  isPrivate,
  onChange,
}: {
  audioUrl?: string;
  audioKey?: string;
  isPrivate: boolean;
  onChange: (result: { audioUrl?: string; audioKey?: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("visibility", isPrivate ? "private" : "public");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il caricamento.");
        return;
      }
      onChange(isPrivate ? { audioKey: data.key } : { audioUrl: data.url });
    } catch {
      setError("Errore di rete durante il caricamento.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  const hasAudio = !!(audioUrl || audioKey);

  return (
    <div>
      {hasAudio ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground/70">
          <Music className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="flex-1 truncate">
            {isPrivate ? "Audio caricato (privato, riservato a chi acquista)" : "Audio caricato"}
          </span>
          <button
            type="button"
            onClick={() => onChange({ audioUrl: undefined, audioKey: undefined })}
            aria-label="Rimuovi audio"
            className="cursor-pointer text-foreground/40 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-foreground/50 hover:border-primary hover:text-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
          {loading ? "Caricamento..." : "Carica audio (MP3/M4A)"}
          <input type="file" accept="audio/mpeg,audio/x-m4a,audio/mp4" className="hidden" onChange={handleFile} />
        </label>
      )}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
