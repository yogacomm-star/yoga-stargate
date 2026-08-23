import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import BlogCard, { type BlogCardData } from "@/components/site/BlogCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog",
  description: "Riflessioni, pratiche e approfondimenti sullo Yoga Multidimensionale a cura di Tina Mastandrea.",
  alternates: { canonical: "/blog" },
};

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string; pagina?: string }>;
}) {
  const { categoria, q, pagina } = await searchParams;
  const page = Math.max(1, Number(pagina) || 1);

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const query = q?.trim().toLowerCase();

  const filtered = posts.filter((p) => {
    const matchesCategory = !categoria || p.category === categoria;
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.excerpt.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cards: BlogCardData[] = paged.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    author: p.author,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    readTimeMinutes: p.readTimeMinutes,
    image: p.featuredImage,
  }));

  function pageHref(params: { categoria?: string; q?: string; pagina?: number }) {
    const sp = new URLSearchParams();
    if (params.categoria) sp.set("categoria", params.categoria);
    if (params.q) sp.set("q", params.q);
    if (params.pagina && params.pagina > 1) sp.set("pagina", String(params.pagina));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  return (
    <>
      <Hero
        eyebrow="Blog"
        title="Riflessioni e pratiche"
        subtitle="Articoli su yoga multidimensionale, consapevolezza quotidiana e neuroscienza applicata alla pratica."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href={pageHref({ q })}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                !categoria ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
              }`}
            >
              Tutte
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={pageHref({ categoria: c, q })}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  categoria === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>

          <form method="get" className="flex items-center gap-2">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cerca nel blog..."
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
            <button type="submit" className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Cerca
            </button>
          </form>
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-foreground/60">Nessun articolo trovato.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginazione blog">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageHref({ categoria, q, pagina: p })}
                aria-current={p === page}
                className={`cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium ${
                  p === page ? "bg-primary text-primary-foreground" : "border border-border text-foreground/70 hover:border-primary"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </>
  );
}
