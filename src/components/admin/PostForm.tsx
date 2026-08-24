"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import ImageUploadField from "@/components/admin/ImageUploadField";
import AiDraftButton from "@/components/admin/AiDraftButton";
import GenerateFullDraftButton from "@/components/admin/GenerateFullDraftButton";

export type PostFormData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string;
  featuredImage: string | null;
};

export default function PostForm({ initial, categories = [] }: { initial?: PostFormData; categories?: string[] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<PostFormData>(
    initial ?? {
      title: "",
      slug: "",
      category: "",
      excerpt: "",
      content: "",
      author: "Tina Mastandrea",
      status: "DRAFT",
      publishedAt: "",
      featuredImage: null,
    }
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  type PostDraft = { title: string; slug: string; category: string; excerpt: string; content: string };

  function applyDraft(draft: PostDraft) {
    setSlugTouched(true);
    setForm((f) => ({
      ...f,
      title: draft.title,
      slug: draft.slug,
      category: draft.category,
      excerpt: draft.excerpt,
      content: draft.content,
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
      excerpt: form.excerpt,
      content: form.content,
      author: form.author,
      status: form.status,
      publishedAt: form.publishedAt || null,
      featuredImage: form.featuredImage,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/posts/${initial!.id}` : "/api/admin/posts", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il salvataggio.");
        return;
      }
      router.push("/admin/blog");
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
      {!isEdit && <GenerateFullDraftButton<PostDraft> kind="post" onGenerated={applyDraft} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="post-title" className={labelClass}>Titolo</label>
          <input
            id="post-title"
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
          <label htmlFor="post-slug" className={labelClass}>Slug (URL)</label>
          <input
            id="post-slug"
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
          <label htmlFor="post-category" className={labelClass}>Categoria</label>
          <input
            id="post-category"
            required
            list="post-categories"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass}
          />
          <datalist id="post-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="post-author" className={labelClass}>Autore</label>
          <input
            id="post-author"
            required
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="post-excerpt" className={labelClass + " mb-0"}>Estratto (anteprima card)</label>
          <AiDraftButton
            kind="post"
            field="excerpt"
            title={form.title}
            category={form.category}
            onGenerated={(text) => setForm((f) => ({ ...f, excerpt: text }))}
          />
        </div>
        <textarea
          id="post-excerpt"
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="post-content" className={labelClass + " mb-0"}>Contenuto (supporta markdown)</label>
          <AiDraftButton
            kind="post"
            field="content"
            title={form.title}
            category={form.category}
            notes={form.excerpt}
            onGenerated={(text) => setForm((f) => ({ ...f, content: text }))}
          />
        </div>
        <textarea
          id="post-content"
          required
          rows={10}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className={inputClass}
        />
      </div>

      <ImageUploadField
        label="Immagine in evidenza"
        value={form.featuredImage}
        onChange={(url) => setForm((f) => ({ ...f, featuredImage: url }))}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="post-published-at" className={labelClass}>Data di pubblicazione</label>
          <input
            id="post-published-at"
            type="date"
            value={form.publishedAt}
            onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-foreground/50">Se lasciata vuota e pubblichi ora, verrà usata la data odierna.</p>
        </div>
        <div>
          <label htmlFor="post-status" className={labelClass}>Stato</label>
          <select
            id="post-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "DRAFT" | "PUBLISHED" }))}
            className={inputClass}
          >
            <option value="DRAFT">Bozza</option>
            <option value="PUBLISHED">Pubblicato</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Salvataggio..." : isEdit ? "Salva modifiche" : "Pubblica articolo"}
      </button>
    </form>
  );
}
