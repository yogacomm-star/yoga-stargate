"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";

export default function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
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
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il caricamento.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Errore di rete durante il caricamento.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt=""
            width={160}
            height={120}
            className="h-28 w-40 rounded-lg border border-border object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Rimuovi immagine"
            className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-destructive p-1 text-white shadow-soft-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className="flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-foreground/50 hover:border-primary hover:text-primary">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="text-xs">{loading ? "Caricamento..." : "Carica immagine"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </label>
      )}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
