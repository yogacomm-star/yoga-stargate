"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Video, Loader2 } from "lucide-react";

async function createGalleryItem(payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Errore durante il salvataggio.");
}

export default function GalleryUploadForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"foto" | "video">("foto");
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? "Errore durante il caricamento.");

      await createGalleryItem({
        type: "IMAGE",
        imageUrl: uploadData.url,
        imageKey: uploadData.key,
        caption: caption.trim() || undefined,
      });
      setCaption("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function handleVideoSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createGalleryItem({ type: "VIDEO", videoUrl: videoUrl.trim(), caption: caption.trim() || undefined });
      setVideoUrl("");
      setCaption("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("foto")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "foto" ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70"
          }`}
        >
          Foto
        </button>
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "video" ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70"
          }`}
        >
          Video
        </button>
      </div>

      <div className="mb-3">
        <label htmlFor="gallery-caption" className="mb-1 block text-sm font-medium text-foreground">
          Didascalia (facoltativa)
        </label>
        <input
          id="gallery-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Es. Ritiro ad Assisi, settembre 2026"
          className={inputClass}
        />
      </div>

      {tab === "foto" ? (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-sm text-foreground/50 hover:border-primary hover:text-primary">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {loading ? "Caricamento..." : "Scegli una foto (JPG, PNG o WEBP)"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} disabled={loading} />
        </label>
      ) : (
        <form onSubmit={handleVideoSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="URL embed YouTube o Vimeo"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
            Aggiungi video
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
