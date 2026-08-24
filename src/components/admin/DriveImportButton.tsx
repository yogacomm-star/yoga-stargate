"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FolderInput, Loader2 } from "lucide-react";

export default function DriveImportButton() {
  const [open, setOpen] = useState(false);
  const [folderUrl, setFolderUrl] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses/import-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl, price: price ? Number(price) : null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'importazione.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
      >
        <FolderInput className="h-4 w-4" aria-hidden="true" />
        Importa da Drive
      </button>
    );
  }

  if (done) {
    return (
      <div className="mb-6 w-full rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
        <p className="font-semibold text-foreground">Importazione avviata.</p>
        <p className="mt-1 text-foreground/70">
          Il corso è stato creato come bozza con il nome della cartella. Il download e caricamento dei file audio
          continua in background: aggiorna questa pagina tra qualche minuto per vedere le lezioni caricate, poi apri
          il corso per rivedere e pubblicare.
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setDone(false);
            setFolderUrl("");
            setPrice("");
          }}
          className="mt-3 cursor-pointer text-sm font-semibold text-primary"
        >
          Chiudi
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid w-full gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft-sm sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h3 className="font-heading text-base font-semibold text-foreground">Importa corso da Google Drive</h3>
        <p className="mt-1 text-xs text-foreground/60">
          Incolla il link di una cartella Drive condivisa come &quot;chiunque abbia il link&quot;. Il sito legge la
          descrizione (documento Google), la copertina (immagine) e le lezioni (i file audio, in ordine di nome) e
          crea automaticamente un corso in bozza.
        </p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="drive-folder-url" className="mb-1 block text-xs font-medium text-foreground/70">
          Link della cartella Drive
        </label>
        <input
          id="drive-folder-url"
          required
          value={folderUrl}
          onChange={(e) => setFolderUrl(e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="drive-price" className="mb-1 block text-xs font-medium text-foreground/70">
          Prezzo (€, lascia vuoto se gratuito)
        </label>
        <input
          id="drive-price"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-foreground/50">Se impostato, l&apos;audio viene caricato privato.</p>
      </div>
      {error && <p className="text-sm font-medium text-destructive sm:col-span-2">{error}</p>}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Avvio..." : "Importa"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="cursor-pointer text-sm font-medium text-foreground/60">
          Annulla
        </button>
      </div>
    </form>
  );
}
