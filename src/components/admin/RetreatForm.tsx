"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/slug";
import ImageUploadField from "@/components/admin/ImageUploadField";
import MultiImageField from "@/components/admin/MultiImageField";
import SectionsEditor from "@/components/admin/SectionsEditor";
import RichTextField from "@/components/admin/RichTextField";
import { splitIntoSections, sectionsToMarkdown, type Section } from "@/lib/sectionize";
import { ALL_EVENT_CATEGORIES } from "@/lib/eventCategories";
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
  /** Altre foto oltre alla copertina (location, Tina, il gruppo), mostrate intere nella pagina. */
  gallery: string[];
  videoUrl: string;
  itinerary: ItineraryDay[];
};

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
      gallery: [],
      videoUrl: "",
      itinerary: [],
    }
  );
  // Il testo lungo si scrive a riquadri (titolo + testo). Un evento già esistente, scritto
  // come testo unico, viene diviso qui nei suoi riquadri; al salvataggio torna a essere testo.
  const [sections, setSections] = useState<Section[]>(() =>
    initial?.description ? splitIntoSections(initial.description) : [{ heading: "", body: "" }]
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
      itinerary: draft.itinerary,
    }));
    setSections(splitIntoSections(draft.description));
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
    if (!sectionsToMarkdown(sections)) {
      setError("Scrivi almeno un riquadro con del testo.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      location: form.location,
      excerpt: form.excerpt,
      description: sectionsToMarkdown(sections),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      price: form.price ? Number(form.price) : null,
      images: [...(form.coverImage ? [form.coverImage] : []), ...form.gallery],
      videoUrl: form.videoUrl.trim() || null,
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
          <select
            id="retreat-category"
            required
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass}
          >
            <option value="" disabled>Scegli la categoria…</option>
            {ALL_EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {/* Eventi creati prima con un'altra categoria: resta selezionabile finché non la cambi. */}
            {form.category && !(ALL_EVENT_CATEGORIES as readonly string[]).includes(form.category) && (
              <option value={form.category}>{form.category} (vecchia categoria)</option>
            )}
          </select>
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
            currentText={form.excerpt}
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
          <label className={labelClass + " mb-0"}>Riquadri della pagina</label>
          <AiDraftButton
            kind="retreat"
            field="description"
            title={form.title}
            category={form.category}
            location={form.location}
            notes={form.excerpt}
            currentText={sectionsToMarkdown(sections)}
            onGenerated={(text) => setSections(splitIntoSections(text))}
          />
        </div>
        <p className="mb-3 text-xs text-foreground/60">
          Ogni riquadro ha il titolo che scegli tu (es. “A chi è rivolto”, “Programma”, “Cosa vivi”) e diventa una
          scheda nella pagina dell&apos;evento. Con le frecce li sposti, con la X li elimini.
        </p>
        <SectionsEditor sections={sections} onChange={setSections} />
      </div>

      <ImageUploadField
        label="Immagine di copertina"
        value={form.coverImage}
        onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
      />

      <MultiImageField
        label="Altre foto"
        hint="Foto della location, tue, del gruppo: le puoi aggiungere quante vuoi. Nella pagina compaiono intere, senza tagli."
        value={form.gallery}
        onChange={(urls) => setForm((f) => ({ ...f, gallery: urls }))}
      />

      <div>
        <label htmlFor="retreat-video" className={labelClass}>Video (facoltativo)</label>
        <input
          id="retreat-video"
          placeholder="URL embed YouTube o Vimeo (facoltativo)"
          value={form.videoUrl}
          onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-foreground/50">
          Un video di presentazione dell&apos;evento, mostrato nella pagina insieme alla foto di copertina.
        </p>
      </div>

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
          <label htmlFor="retreat-price" className={labelClass}>Prezzo (€) — attiva “Prenota e paga”</label>
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
          <label htmlFor="retreat-cta-label" className={labelClass}>Testo del pulsante di richiesta</label>
          <input
            id="retreat-cta-label"
            value={form.ctaLabel}
            onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="retreat-cta-url" className={labelClass}>Link di prenotazione esterno (facoltativo)</label>
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
              <RichTextField
                ariaLabel={`Descrizione del giorno ${day.day}`}
                placeholder="Descrizione"
                rows={3}
                value={day.description}
                onChange={(text) => updateItinerary(i, { description: text })}
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
          {loading ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Crea evento"}
        </button>
      </div>
    </form>
  );
}
