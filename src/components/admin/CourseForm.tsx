"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { slugify } from "@/lib/slug";
import ImageUploadField from "@/components/admin/ImageUploadField";
import AiDraftButton from "@/components/admin/AiDraftButton";
import GenerateFullDraftButton from "@/components/admin/GenerateFullDraftButton";
import AudioUploadField from "@/components/admin/AudioUploadField";

type Lesson = { title: string; videoUrl: string; content: string; audioUrl?: string; audioKey?: string };

export type CourseFormData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  description: string;
  requiredLevel: string;
  price: string;
  status: "DRAFT" | "PUBLISHED";
  coverImage: string | null;
  lessons: Lesson[];
};

export default function CourseForm({ initial, categories = [] }: { initial?: CourseFormData; categories?: string[] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<CourseFormData>(
    initial ?? {
      title: "",
      slug: "",
      category: "",
      excerpt: "",
      description: "",
      requiredLevel: "",
      price: "",
      status: "DRAFT",
      coverImage: null,
      lessons: [],
    }
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  type CourseDraft = {
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    description: string;
    lessons: Lesson[];
  };

  function applyDraft(draft: CourseDraft) {
    setSlugTouched(true);
    setForm((f) => ({
      ...f,
      title: draft.title,
      slug: draft.slug,
      category: draft.category,
      excerpt: draft.excerpt,
      description: draft.description,
      lessons: draft.lessons,
    }));
  }

  function updateLesson(index: number, patch: Partial<Lesson>) {
    setForm((f) => ({ ...f, lessons: f.lessons.map((l, i) => (i === index ? { ...l, ...patch } : l)) }));
  }

  function addLesson() {
    setForm((f) => ({ ...f, lessons: [...f.lessons, { title: "", videoUrl: "", content: "" }] }));
  }

  function removeLesson(index: number) {
    setForm((f) => ({ ...f, lessons: f.lessons.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      excerpt: form.excerpt,
      description: form.description,
      lessons: form.lessons,
      coverImage: form.coverImage,
      requiredLevel: form.requiredLevel ? Number(form.requiredLevel) : null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/courses/${initial!.id}` : "/api/admin/courses", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il salvataggio.");
        return;
      }
      router.push("/admin/corsi");
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
      {!isEdit && <GenerateFullDraftButton<CourseDraft> kind="course" onGenerated={applyDraft} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="course-title" className={labelClass}>Titolo</label>
          <input
            id="course-title"
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
          <label htmlFor="course-slug" className={labelClass}>Slug (URL)</label>
          <input
            id="course-slug"
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
          <label htmlFor="course-category" className={labelClass}>Categoria</label>
          <input
            id="course-category"
            required
            list="course-categories"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass}
          />
          <datalist id="course-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="course-level" className={labelClass}>Livello richiesto</label>
          <select
            id="course-level"
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

      <div>
        <label htmlFor="course-price" className={labelClass}>Prezzo (€, opzionale)</label>
        <input
          id="course-price"
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Lascia vuoto se il corso è gratuito/incluso per livello"
          className={inputClass + " max-w-xs"}
        />
        <p className="mt-1 text-xs text-foreground/50">
          Se impostato, l&apos;audio delle lezioni è privato e riservato a chi acquista il corso.
        </p>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="course-excerpt" className={labelClass + " mb-0"}>Estratto (anteprima card)</label>
          <AiDraftButton
            kind="course"
            field="excerpt"
            title={form.title}
            category={form.category}
            onGenerated={(text) => setForm((f) => ({ ...f, excerpt: text }))}
          />
        </div>
        <textarea
          id="course-excerpt"
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="course-description" className={labelClass + " mb-0"}>Descrizione completa</label>
          <AiDraftButton
            kind="course"
            field="description"
            title={form.title}
            category={form.category}
            notes={form.excerpt}
            onGenerated={(text) => setForm((f) => ({ ...f, description: text }))}
          />
        </div>
        <textarea
          id="course-description"
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass + " mb-0"}>Lezioni</label>
          <button type="button" onClick={addLesson} className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary">
            <Plus className="h-4 w-4" /> Aggiungi lezione
          </button>
        </div>
        <div className="space-y-3">
          {form.lessons.map((lesson, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-primary/70">Lezione {i + 1}</span>
                <button type="button" onClick={() => removeLesson(i)} className="cursor-pointer text-foreground/40 hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                aria-label={`Titolo lezione ${i + 1}`}
                placeholder="Titolo lezione"
                value={lesson.title}
                onChange={(e) => updateLesson(i, { title: e.target.value })}
                className={inputClass + " mb-2"}
              />
              <input
                aria-label={`URL video lezione ${i + 1}`}
                placeholder="URL embed YouTube o Vimeo (facoltativo)"
                value={lesson.videoUrl}
                onChange={(e) => updateLesson(i, { videoUrl: e.target.value })}
                className={inputClass + " mb-2"}
              />
              <textarea
                aria-label={`Contenuto lezione ${i + 1}`}
                placeholder="Contenuto testuale"
                rows={2}
                value={lesson.content}
                onChange={(e) => updateLesson(i, { content: e.target.value })}
                className={inputClass + " mb-2"}
              />
              <AudioUploadField
                audioUrl={lesson.audioUrl}
                audioKey={lesson.audioKey}
                isPrivate={!!form.price}
                onChange={(result) => updateLesson(i, { audioUrl: result.audioUrl, audioKey: result.audioKey })}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="course-status" className={labelClass}>Stato</label>
        <select
          id="course-status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}
          className={inputClass + " max-w-xs"}
        >
          <option value="DRAFT">Bozza</option>
          <option value="PUBLISHED">Pubblicato</option>
        </select>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Crea corso"}
      </button>
    </form>
  );
}
