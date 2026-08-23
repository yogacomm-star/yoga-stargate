"use client";

import { useState } from "react";
import { Sparkles, Download, Loader2 } from "lucide-react";

export default function BannerGenerator({ retreatId }: { retreatId: string }) {
  const [tagline, setTagline] = useState("");
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bannerUrl = `/api/retreats/${retreatId}/banner?tagline=${encodeURIComponent(tagline)}&v=${version}`;

  async function generateTagline() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/retreats/${retreatId}/tagline`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante la generazione.");
        return;
      }
      setTagline(data.tagline);
      setVersion((v) => v + 1);
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold text-foreground">Banner promozionale</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Genera automaticamente un banner con foto, titolo e uno slogan scritto dall&apos;AI, pronto da scaricare e
        condividere.
      </p>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerUrl} alt="Anteprima banner" className="aspect-[1200/630] w-full object-cover" />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateTagline}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {tagline ? "Rigenera slogan con AI" : "Genera slogan con AI"}
        </button>
        <a
          href={bannerUrl}
          download={`banner-${retreatId}.png`}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary"
        >
          <Download className="h-4 w-4" />
          Scarica banner
        </a>
      </div>
    </div>
  );
}
