"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/slug";
import ImageUploadField from "@/components/admin/ImageUploadField";
import AiDraftButton from "@/components/admin/AiDraftButton";
import GenerateFullDraftButton from "@/components/admin/GenerateFullDraftButton";

type ItineraryDay = { day: number; title: string; description: string };

export type RetreatFormData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  excerpt: string;
  description: string;
  startDate: string;
  endDate: string;
  price: string;
  requiredLevel: string;
  ctaLabel: string;
  ctaUrl: string;
  status: "DRAFT" | "PUBLISHED";
  coverImage: string | null;
  itinerary: ItineraryDay[];
};

const CATEGORIES = ["Trasformativo", "Esperienziale", "Consapevolezza", "Viaggio"];

export default function RetreatForm({ initial }: { initial?: RetreatFormData }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<RetreatFormData>(
    initial ?? {
      title: "",
      slug: "",
      category: "",
      location: "",
      excerpt: "",
      description: "",
      startDate: "",
      endDate: "",
      price: "",
      requiredLevel: "",
      ctaLabel: "Richiedi informazioni",
      ctaUrl: "",
      status: "DRAFT",
      coverImage: null,
      itinerary: [],
    }
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  type RetreatDraft = {
    title: string;
    slug: string;
    category: string;
    location: string;
    excerpt: string;
    description: string;
    itinerary: ItineraryDay[];
  };

  function applyDraft(draft: RetreatDraft) {
    setSlugTouched(true);
    setForm((f) => ({
      ...f,
      title: draft.title,
      slug: draft.slug,
      category: draft.category,
      location: draft.location,
      excerpt: draft.excerpt,
      description: draft.description,
      itinerary: draft.itinerary,
    }));
  }

  function updateItinerary(index: number, patch: Partial<ItineraryDay>) {
    setForm((f) => ({
      ...f,
      itinerary: f.itinerary.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    }));
  }

  function addDay() {
    setForm((f) => ({
      ...f,
      itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: "", description: "" }],
    }));
  }

  function removeDay(index: number) {
    setForm((f) => ({
      ...f,
      itinerary: f.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      location: form.location,
      excerpt: form.excerpt,
      description: form.description,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      price: form.price ? Number(form.price) : null,
      images: form.coverImage ? [form.coverImage] : [],
      itinerary: form.itinerary,
      requiredLevel: form.requiredLevel ? Number(form.requiredLevel) : null,
      ctaLabel: form.ctaLabel,
      ctaUrl: form.ctaUrl || null,
      status: form.status,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/retreats/${initial!.id}` : "/api/admin/retreats", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il salvataggio.");
        return;
      }
      router.push("/admin/ritiri");
      router.refresh();
    } catch {
      setError("Errore di rete, riprova.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1 block text-sm font-medium text-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEdit && <GenerateFullDraftButton<RetreatDraft> kind="retreat" onGenerated={applyDraft} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="retreat-title" className={labelClass}>Titolo</label>
          <input
            id="retreat-title"
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="retreat-slug" className={labelClass}>Slug (URL)</label>
          <input
            id="retreat-slug"
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="retreat-category" className={labelClass}>Categoria</label>
          <input
            id="retreat-category"
            required
            list="retreat-categories"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass}
          />
          <datalist id="retreat-categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="retreat-location" className={labelClass}>Luogo</label>
          <input
            id="retreat-location"
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="retreat-excerpt" className={labelClass + " mb-0"}>Estratto (anteprima card)</label>
          <AiDraftButton
            kind="retreat"
            field="excerpt"
            title={form.title}
            category={form.category}
            location={form.location}
            onGenerated={(text) => setForm((f) => ({ ...f, excerpt: text }))}
          />
        </div>
        <textarea
          id="retreat-excerpt"
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="retreat-description" className={labelClass + " mb-0"}>Descrizione completa</label>
          <AiDraftButton
            kind="retreat"
            field="description"
            title={form.title}
            category={form.category}
            location={form.location}
            notes={form.excerpt}
            onGenerated={(text) => setForm((f) => ({ ...f, description: text }))}
          />
        </div>
        <textarea
          id="retreat-description"
          required
          rows={6}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={inputClass}
        />
      </div>

      <ImageUploadField
        label="Immagine di copertina"
        value={form.coverImage}
        onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="retreat-start" className={labelClass}>Data inizio</label>
          <input
            id="retreat-start"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="retreat-end" className={labelClass}>Data fine</label>
          <input
            id="retreat-end"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="retreat-price" className={labelClass}>Prezzo (€)</label>
          <input
            id="retreat-price"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="retreat-level" className={labelClass}>Livello richiesto</label>
          <select
            id="retreat-level"
            value={form.requiredLevel}
            onChange={(e) => setForm((f) => ({ ...f, requiredLevel: e.target.value }))}
            className={inputClass}
          >
            <option value="">Aperto a tutti</option>
            <option value="1">Base</option>
            <option value="2">Intermedio</option>
            <option value="3">Avanzato</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="retreat-cta-label" className={labelClass}>Testo del pulsante</label>
          <input
            id="retreat-cta-label"
            value={form.ctaLabel}
            onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="retreat-cta-url" className={labelClass}>Link esterno (facoltativo)</label>
          <input
            id="retreat-cta-url"
            value={form.ctaUrl}
            onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass + " mb-0"}>Programma (giorno per giorno)</label>
          <button
            type="button"
            onClick={addDay}
            className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary"
          >
            <Plus className="h-4 w-4" /> Aggiungi giorno
          </button>
        </div>
        <div className="space-y-3">
          {form.itinerary.map((day, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-primary/70">Giorno {day.day}</span>
                <button type="button" onClick={() => removeDay(i)} className="cursor-pointer text-foreground/40 hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                aria-label={`Titolo del giorno ${day.day}`}
                placeholder="Titolo"
                value={day.title}
                onChange={(e) => updateItinerary(i, { title: e.target.value })}
                className={inputClass + " mb-2"}
              />
              <textarea
                aria-label={`Descrizione del giorno ${day.day}`}
                placeholder="Descrizione"
                rows={2}
                value={day.description}
                onChange={(e) => updateItinerary(i, { description: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="retreat-status" className={labelClass}>Stato</label>
        <select
          id="retreat-status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}
          className={inputClass + " max-w-xs"}
        >
          <option value="DRAFT">Bozza</option>
          <option value="PUBLISHED">Pubblicato</option>
        </select>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Crea ritiro"}
        </button>
      </div>
    </form>
  );
}
