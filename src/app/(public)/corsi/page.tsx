import type { Metadata } from "next";
import Hero from "@/components/site/Hero";
import CourseCard, { type CourseCardData } from "@/components/site/CourseCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Corsi di Yoga Online",
  description: "La libreria dei corsi Yoga Stargate: alcuni aperti a tutti, altri riservati per livello.",
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
  const courses = await prisma.course.findMany({
    // "Risorsa gratuita" (es. il dono "7 Giorni per Meditare Bene") è un contenuto a sé,
    // promosso dalla home e da Risorse: non compare nella libreria generale dei corsi.
    where: { status: "PUBLISHED", NOT: { category: "Risorsa gratuita" } },
    orderBy: { createdAt: "desc" },
  });

  const cards: CourseCardData[] = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    category: c.category,
    excerpt: c.excerpt,
    requiredLevel: c.requiredLevel,
    lessonCount: countLessons(c.lessons),
    image: c.coverImage,
  }));

  return (
    <>
      <Hero
        eyebrow="Corsi"
        title="La libreria dei corsi"
        subtitle="Percorsi in video e testo per approfondire la pratica: alcuni sono aperti a tutti, altri si sbloccano salendo di livello."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {cards.length === 0 ? (
          <p className="text-sm text-foreground/60">Nessun corso disponibile al momento.</p>
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
