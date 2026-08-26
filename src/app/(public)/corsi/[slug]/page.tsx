import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/auth";
import { canAccess } from "@/lib/levels";
import { LevelBadge, LevelLockedNotice, PurchaseLockedNotice } from "@/components/site/LevelLock";
import MarkdownContent from "@/components/site/MarkdownContent";
import CourseProgressToggle from "@/components/site/CourseProgressToggle";
import FavoriteButton from "@/components/site/FavoriteButton";
import ReviewsSection from "@/components/site/ReviewsSection";
import { isAllowedEmbedUrl } from "@/lib/embed";
import { getStripe } from "@/lib/stripe";

type Lesson = { title: string; videoUrl: string; content: string; audioUrl?: string; audioKey?: string };

function parseLessons(raw: string): Lesson[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function getCourse(slug: string) {
  return prisma.course.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return {};
  return { title: course.title, description: course.excerpt };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course || course.status !== "PUBLISHED") notFound();

  const account = await getCurrentAccount();
  const isPaid = !!course.price;

  let purchased = false;
  if (isPaid && account) {
    const existing = await prisma.coursePurchase.findUnique({
      where: { accountId_courseId: { accountId: account.id, courseId: course.id } },
    });
    purchased = !!existing;

    // Ritorno da Stripe Checkout: il webhook potrebbe non essere ancora arrivato, quindi
    // verifichiamo subito la sessione per sbloccare senza far aspettare l'utente.
    const { session_id: sessionId } = await searchParams;
    if (!purchased && sessionId) {
      try {
        const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
        if (
          checkoutSession.payment_status === "paid" &&
          checkoutSession.metadata?.courseId === course.id &&
          checkoutSession.metadata?.accountId === account.id
        ) {
          await prisma.coursePurchase.upsert({
            where: { stripeCheckoutSession: checkoutSession.id },
            create: {
              accountId: account.id,
              courseId: course.id,
              amount: (checkoutSession.amount_total ?? 0) / 100,
              stripeCheckoutSession: checkoutSession.id,
            },
            update: {},
          });
          purchased = true;
        }
      } catch {
        // sessione non valida/scaduta: resta bloccato, il webhook farà comunque il suo corso se il pagamento è andato a buon fine.
      }
    }
  }

  const unlocked = isPaid ? account?.role === "ADMIN" || purchased : canAccess(course.requiredLevel, account?.level);
  const lessons = parseLessons(course.lessons);

  let completed = false;
  if (account) {
    const progress = await prisma.courseProgress.findUnique({
      where: { accountId_courseId: { accountId: account.id, courseId: course.id } },
    });
    completed = progress?.completed ?? false;
  }

  const favorite = account
    ? await prisma.favorite.findUnique({
        where: { accountId_targetType_targetId: { accountId: account.id, targetType: "COURSE", targetId: course.id } },
      })
    : null;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-secondary/30 to-warm-surface" />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">{course.category}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{course.title}</h1>
          <p className="mt-4 text-foreground/70">{course.excerpt}</p>
          <div className="mt-4 flex justify-center">
            <LevelBadge requiredLevel={course.requiredLevel} price={course.price} />
          </div>
        </div>
      </section>

      {course.coverImage && (
        <div className="mx-auto -mt-4 max-w-4xl px-4 sm:px-6">
          <div className="relative h-64 overflow-hidden rounded-3xl shadow-soft-lg sm:h-[28rem]">
            <Image src={course.coverImage} alt={course.title} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <section className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6">
        {!unlocked ? (
          isPaid ? (
            <PurchaseLockedNotice courseId={course.id} price={course.price as number} loggedIn={!!account} />
          ) : (
            <LevelLockedNotice requiredLevel={course.requiredLevel as number} loggedIn={!!account} />
          )
        ) : (
          <>
            <MarkdownContent content={course.description} />

            <div className="mt-8 flex flex-wrap gap-3">
              <CourseProgressToggle courseId={course.id} initialCompleted={completed} loggedIn={!!account} />
              <FavoriteButton
                targetType="COURSE"
                targetId={course.id}
                initialFavorited={!!favorite}
                loggedIn={!!account}
              />
            </div>

            {lessons.length > 0 && (
              <div className="mt-10">
                <h2 className="font-heading text-xl font-semibold text-foreground">Lezioni</h2>
                <div className="mt-4 space-y-4">
                  {lessons.map((lesson, i) => (
                    <div key={lesson.title + i} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <p className="font-heading text-base font-semibold text-foreground">
                          {i + 1}. {lesson.title}
                        </p>
                      </div>
                      {lesson.content && <p className="mt-3 text-sm text-foreground/70">{lesson.content}</p>}
                      {lesson.audioUrl && (
                        <audio controls controlsList="nodownload" preload="none" className="mt-3 w-full">
                          <source src={lesson.audioUrl} type="audio/mpeg" />
                        </audio>
                      )}
                      {lesson.audioKey && (
                        <audio controls controlsList="nodownload" preload="none" className="mt-3 w-full">
                          <source src={`/api/courses/${course.id}/lessons/${i}/stream`} type="audio/mpeg" />
                        </audio>
                      )}
                      {lesson.videoUrl && isAllowedEmbedUrl(lesson.videoUrl) && (
                        <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border">
                          <iframe
                            src={lesson.videoUrl}
                            title={lesson.title}
                            className="h-full w-full"
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <ReviewsSection targetType="COURSE" targetId={course.id} account={account} unlocked={unlocked} />
            </div>
          </>
        )}
      </section>
    </>
  );
}
