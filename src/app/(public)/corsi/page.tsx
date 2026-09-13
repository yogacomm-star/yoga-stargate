import type { Metadata } from "next";
import Hero from "@/components/site/Hero";
import CourseCard, { type CourseCardData } from "@/components/site/CourseCard";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Percorsi Online",
  description: "I Percorsi Online di Yoga Stargate: pratiche guidate, rituali di trasformazione ed ebook, dove e quando vuoi.",
  alternates: { canonical: "/corsi" },
};

type Lesson = { title: string; videoUrl: string; content: string };

function countLessons(raw: string): number {
  try {
    return (JSON.parse(raw) as Lesson[]).length;
  } catch {
    return 0;
  }
}

export default async function CorsiPage() {
  const [courses, account] = await Promise.all([
    prisma.course.findMany({
      // "Risorsa gratuita" (es. il dono "7 Giorni per Meditare Bene") è un contenuto a sé,
      // promosso dalla home: non compare nella libreria generale dei corsi.
      where: { status: "PUBLISHED", NOT: { category: "Risorsa gratuita" } },
      orderBy: { createdAt: "desc" },
    }),
    getCurrentAccount(),
  ]);

  // Chi ha già pagato un corso non deve vederselo riproporre con il prezzo nella scheda,
  // altrimenti sembra di doverlo ricomprare: controlliamo quali acquisti risultano già suoi.
  const purchasedIds = account
    ? new Set(
        (
          await prisma.coursePurchase.findMany({
            where: { accountId: account.id, courseId: { in: courses.map((c) => c.id) } },
            select: { courseId: true },
          })
        ).map((p) => p.courseId)
      )
    : new Set<string>();

  const cards: CourseCardData[] = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    category: c.category,
    excerpt: c.excerpt,
    requiredLevel: c.requiredLevel,
    price: c.price,
    purchased: purchasedIds.has(c.id),
    lessonCount: countLessons(c.lessons),
    image: c.coverImage,
  }));

  return (
    <>
      <Hero
        eyebrow="Percorsi Online"
        title="I Percorsi Online"
        subtitle="Pratiche guidate, rituali di trasformazione ed ebook da vivere dove vuoi, quando vuoi: alcuni aperti a tutti, altri si sbloccano proseguendo nel percorso."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {cards.length === 0 ? (
          <p className="text-sm text-foreground/60">Nessun percorso disponibile al momento.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
