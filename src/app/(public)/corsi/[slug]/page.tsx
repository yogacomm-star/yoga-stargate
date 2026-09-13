import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlayCircle, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/auth";
import { canAccess } from "@/lib/levels";
import { LevelBadge, LevelLockedNotice, PurchaseLockedNotice } from "@/components/site/LevelLock";
import { SectionedContent } from "@/components/site/MarkdownContent";
import ScheduleText from "@/components/site/ScheduleText";
import CourseProgressToggle from "@/components/site/CourseProgressToggle";
import FavoriteButton from "@/components/site/FavoriteButton";
import TestimonialCarousel from "@/components/site/TestimonialCarousel";
import { isAllowedEmbedUrl } from "@/lib/embed";
import { getStripe } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail } from "@/lib/email";
import DraftPreviewBanner from "@/components/site/DraftPreviewBanner";

type Lesson = {
  title: string;
  videoUrl: string;
  content: string;
  audioUrl?: string;
  audioKey?: string;
  fileUrl?: string;
  fileKey?: string;
};

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
  searchParams: Promise<{ session_id?: string; acquisto?: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  const account = await getCurrentAccount();
  // Le bozze restano invisibili a chiunque tranne l'admin: gli permette di aprire l'indirizzo
  // pubblico vero e proprio per vedere come apparirà il corso prima ancora di pubblicarlo.
  if (!course || (course.status !== "PUBLISHED" && account?.role !== "ADMIN")) notFound();

  const isPaid = !!course.price;

  let purchased = false;
  let justPurchased = false;
  if (isPaid && account) {
    const existing = await prisma.coursePurchase.findUnique({
      where: { accountId_courseId: { accountId: account.id, courseId: course.id } },
    });
    purchased = !!existing;

    // Ritorno da Stripe Checkout: il webhook potrebbe non essere ancora arrivato, quindi
    // verifichiamo subito la sessione per sbloccare senza far aspettare l'utente.
    const { session_id: sessionId, acquisto } = await searchParams;
    justPurchased = acquisto === "riuscito";
    if (!purchased && sessionId) {
      try {
        const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
        if (
          checkoutSession.payment_status === "paid" &&
          checkoutSession.metadata?.courseId === course.id &&
          checkoutSession.metadata?.accountId === account.id
        ) {
          const amount = (checkoutSession.amount_total ?? 0) / 100;
          await prisma.coursePurchase.upsert({
            where: { stripeCheckoutSession: checkoutSession.id },
            create: { accountId: account.id, courseId: course.id, amount, stripeCheckoutSession: checkoutSession.id },
            update: {},
          });
          purchased = true;
          // `purchased` era false poco sopra (per questo siamo entrati in questo ramo): questa
          // è la primissima registrazione dell'acquisto, quindi è il momento giusto per l'email
          // di conferma. Se arriva anche il webhook di Stripe per la stessa sessione, il suo
          // controllo "alreadyRecorded" la troverà già presente e non manderà una seconda email.
          await sendPurchaseConfirmationEmail({ email: account.email, courseTitle: course.title, courseSlug: course.slug, amount });
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
      {course.status === "DRAFT" && <DraftPreviewBanner />}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-secondary/30 to-warm-surface" />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">{course.category}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{course.title}</h1>
          <p className="mt-4 text-foreground/70">{course.excerpt}</p>
          <div className="mt-4 flex justify-center">
            <LevelBadge requiredLevel={course.requiredLevel} price={course.price} purchased={purchased} />
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
            {justPurchased && (
              <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 text-sm text-foreground/80">
                <p className="font-semibold text-primary">Pagamento riuscito — corso sbloccato!</p>
                <p className="mt-1">
                  Da ora lo trovi sempre pronto in{" "}
                  <a href="/account" className="cursor-pointer font-semibold text-primary underline underline-offset-2">
                    Il mio account
                  </a>
                  , insieme a tutti gli altri corsi che acquisti.
                </p>
              </div>
            )}
            <SectionedContent content={course.description} />

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
                    <div key={lesson.title + i} className="rounded-3xl border border-border bg-card p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <PlayCircle className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <p className="font-heading text-base font-semibold text-foreground">
                          {i + 1}. {lesson.title}
                        </p>
                      </div>
                      {lesson.content && <ScheduleText text={lesson.content} className="mt-3 text-sm text-foreground/70" />}
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
                      {lesson.fileUrl && (
                        <a
                          href={lesson.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                        >
                          <FileText className="h-4 w-4" aria-hidden="true" />
                          Scarica il materiale (PDF)
                        </a>
                      )}
                      {lesson.fileKey && (
                        <a
                          href={`/api/courses/${course.id}/lessons/${i}/file`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
                        >
                          <FileText className="h-4 w-4" aria-hidden="true" />
                          Scarica il materiale (PDF)
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">Testimonianze</h2>
              <TestimonialCarousel />
            </div>
          </>
        )}
      </section>
    </>
  );
}
