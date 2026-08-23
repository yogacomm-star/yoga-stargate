import type { Metadata } from "next";
import SearchBar from "@/components/site/SearchBar";
import RetreatCard, { type RetreatCardData } from "@/components/site/RetreatCard";
import CourseCard, { type CourseCardData } from "@/components/site/CourseCard";
import BlogCard, { type BlogCardData } from "@/components/site/BlogCard";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/images";

export const metadata: Metadata = { title: "Cerca", robots: { index: false, follow: true } };

type Lesson = { title: string; videoUrl: string; content: string };

function matches(query: string, ...fields: string[]) {
  const q = query.toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(q));
}

export default async function CercaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Cerca nel sito</h1>
        <p className="mt-3 text-sm text-foreground/60">Trova corsi, ritiri e articoli del blog.</p>
        <div className="mt-8">
          <SearchBar />
        </div>
      </div>
    );
  }

  const [retreats, courses, posts] = await Promise.all([
    prisma.retreat.findMany({ where: { status: "PUBLISHED" } }),
    prisma.course.findMany({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" } }),
  ]);

  const retreatResults = retreats.filter((r) => matches(query, r.title, r.excerpt, r.category, r.location));
  const courseResults = courses.filter((c) => matches(query, c.title, c.excerpt, c.category));
  const postResults = posts.filter((p) => matches(query, p.title, p.excerpt, p.category));

  const totalResults = retreatResults.length + courseResults.length + postResults.length;

  const retreatCards: RetreatCardData[] = retreatResults.map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    location: r.location,
    excerpt: r.excerpt,
    price: r.price,
    requiredLevel: r.requiredLevel,
    startDate: r.startDate ? r.startDate.toISOString() : null,
    endDate: r.endDate ? r.endDate.toISOString() : null,
    image: firstImage(r.images),
  }));

  const courseCards: CourseCardData[] = courseResults.map((c) => {
    let count = 0;
    try {
      count = (JSON.parse(c.lessons) as Lesson[]).length;
    } catch {}
    return {
      slug: c.slug,
      title: c.title,
      category: c.category,
      excerpt: c.excerpt,
      requiredLevel: c.requiredLevel,
      lessonCount: count,
      image: c.coverImage,
    };
  });

  const postCards: BlogCardData[] = postResults.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    author: p.author,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    readTimeMinutes: p.readTimeMinutes,
    image: p.featuredImage,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Risultati per &ldquo;{query}&rdquo;</h1>
      <p className="mt-1 text-sm text-foreground/60">{totalResults} risultati trovati</p>
      <div className="mt-6 max-w-lg">
        <SearchBar initialQuery={query} />
      </div>

      {totalResults === 0 && <p className="mt-10 text-sm text-foreground/60">Nessun risultato. Prova con altri termini.</p>}

      {retreatCards.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-foreground">Ritiri</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {retreatCards.map((r) => (
              <RetreatCard key={r.slug} retreat={r} />
            ))}
          </div>
        </section>
      )}

      {courseCards.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-foreground">Corsi</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courseCards.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </section>
      )}

      {postCards.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-foreground">Blog</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {postCards.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
