"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";

const MAX_SIDE = 2000;

// Ridimensiona nel browser prima del caricamento: le foto scattate col telefono superano
// facilmente il limite di 5MB del server, e non serve tenerle a piena risoluzione sul sito.
async function shrinkImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Più foto (location, Tina, il gruppo…) senza ritaglio forzato: sul sito compaiono intere, con
// le proporzioni originali, così nessun viso o dettaglio viene tagliato.
export default function MultiImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      for (const original of files) {
        const file = await shrinkImage(original);
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Errore durante il caricamento.");
          break;
        }
        uploaded.push(data.url);
      }
    } catch {
      setError("Errore di rete durante il caricamento.");
    } finally {
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
      setBusy(false);
    }
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="mb-2 text-xs text-foreground/60">{hint}</p>}
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative">
            <Image
              src={url}
              alt=""
              width={160}
              height={120}
              className="h-24 w-32 rounded-lg border border-border object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              aria-label="Rimuovi foto"
              className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-destructive p-1 text-white shadow-soft-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="mt-1 flex justify-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Sposta la foto prima"
                className="cursor-pointer rounded p-1 text-foreground/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="Sposta la foto dopo"
                className="cursor-pointer rounded p-1 text-foreground/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-foreground/50 hover:border-primary hover:text-primary">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="text-xs">{busy ? "Carico..." : "Aggiungi foto"}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFiles}
            disabled={busy}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
