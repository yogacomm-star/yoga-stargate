"use client";

import { useCallback, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { ImagePlus, X, Loader2, Check, ZoomIn } from "lucide-react";
import { getCroppedImageBlob } from "@/lib/cropImage";

export default function ImageUploadField({
  label,
  value,
  onChange,
  aspectRatio = 4 / 3,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  // Rapporto largezza/altezza del ritaglio: 4/3 è una buona approssimazione generale
  // sia per le card (anteprima negli elenchi) sia per l'immagine in alto nella pagina.
  aspectRatio?: number;
}) {
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPendingImage(URL.createObjectURL(file));
    e.target.value = "";
  }

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  function cancelCrop() {
    if (pendingImage) URL.revokeObjectURL(pendingImage);
    setPendingImage(null);
  }

  async function confirmCrop() {
    if (!pendingImage || !croppedAreaPixels) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(pendingImage, croppedAreaPixels);
      const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il caricamento.");
        return;
      }
      onChange(data.url);
      URL.revokeObjectURL(pendingImage);
      setPendingImage(null);
    } catch {
      setError("Errore di rete durante il caricamento.");
    } finally {
      setLoading(false);
    }
  }

  if (pendingImage) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
        <p className="mb-2 text-xs text-foreground/60">
          Trascina per spostare l&apos;inquadratura, usa il cursore per ingrandire: è così che la foto apparirà sul
          sito.
        </p>
        <div className="relative h-64 w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted">
          <Cropper
            image={pendingImage}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="mt-3 flex max-w-md items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-foreground/50" aria-hidden="true" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom sull'immagine"
            className="flex-1 cursor-pointer accent-primary"
          />
        </div>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={confirmCrop}
            disabled={loading || !croppedAreaPixels}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {loading ? "Carico..." : "Usa questa foto"}
          </button>
          <button
            type="button"
            onClick={cancelCrop}
            disabled={loading}
            className="cursor-pointer text-sm font-medium text-foreground/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annulla
          </button>
        </div>
      </div>
    );
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
          <div className="absolute -top-2 -right-2 flex gap-1">
            <label
              aria-label="Sostituisci immagine"
              className="cursor-pointer rounded-full bg-card p-1 text-foreground/60 shadow-soft-sm hover:text-primary"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Rimuovi immagine"
              className="cursor-pointer rounded-full bg-destructive p-1 text-white shadow-soft-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-foreground/50 hover:border-primary hover:text-primary">
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs">Carica immagine</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </label>
      )}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
