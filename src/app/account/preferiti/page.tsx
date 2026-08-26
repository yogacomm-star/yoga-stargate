import Link from "next/link";
import { getCurrentAccount } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RetreatCard, { type RetreatCardData } from "@/components/site/RetreatCard";
import CourseCard, { type CourseCardData } from "@/components/site/CourseCard";
import { firstImage } from "@/lib/images";

export const metadata = { title: "I miei preferiti" };

type Lesson = { title: string; videoUrl: string; content: string };

export default async function PreferitiPage() {
  const account = await getCurrentAccount();
  if (!account) return null;

  const favorites = await prisma.favorite.findMany({ where: { accountId: account.id } });
  const retreatIds = favorites.filter((f) => f.targetType === "RETREAT").map((f) => f.targetId);
  const courseIds = favorites.filter((f) => f.targetType === "COURSE").map((f) => f.targetId);

  const [retreats, courses] = await Promise.all([
    retreatIds.length ? prisma.retreat.findMany({ where: { id: { in: retreatIds } } }) : Promise.resolve([]),
    courseIds.length ? prisma.course.findMany({ where: { id: { in: courseIds } } }) : Promise.resolve([]),
  ]);

  const retreatCards: RetreatCardData[] = retreats.map((r) => ({
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

  const courseCards: CourseCardData[] = courses.map((c) => {
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
      price: c.price,
      lessonCount: count,
      image: c.coverImage,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">I miei preferiti</h1>
      <p className="mt-1 text-sm text-foreground/60">
        <Link href="/account" className="cursor-pointer text-primary">
          ← Torna al mio account
        </Link>
      </p>

      {retreatCards.length === 0 && courseCards.length === 0 ? (
        <p className="mt-8 text-sm text-foreground/60">Non hai ancora salvato nessun preferito.</p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
