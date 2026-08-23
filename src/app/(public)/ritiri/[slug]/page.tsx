import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/auth";
import { canAccess } from "@/lib/levels";
import { LevelBadge, LevelLockedNotice } from "@/components/site/LevelLock";
import MarkdownContent from "@/components/site/MarkdownContent";
import LeadForm from "@/components/site/LeadForm";
import FavoriteButton from "@/components/site/FavoriteButton";
import ReviewsSection from "@/components/site/ReviewsSection";
import JsonLd from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";
import { firstImage } from "@/lib/images";

type Itinerary = { day: number; title: string; description: string }[];

function parseItinerary(raw: string): Itinerary {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function getRetreat(slug: string) {
  return prisma.retreat.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const retreat = await getRetreat(slug);
  if (!retreat) return {};
  return {
    title: retreat.title,
    description: retreat.excerpt,
    alternates: { canonical: `/ritiri/${retreat.slug}` },
    openGraph: { title: retreat.title, description: retreat.excerpt, type: "website" },
  };
}

export default async function RetreatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retreat = await getRetreat(slug);
  if (!retreat || retreat.status !== "PUBLISHED") notFound();

  const account = await getCurrentAccount();
  const unlocked = canAccess(retreat.requiredLevel, account?.level);
  const itinerary = parseItinerary(retreat.itinerary);

  const favorite = account
    ? await prisma.favorite.findUnique({
        where: { accountId_targetType_targetId: { accountId: account.id, targetType: "RETREAT", targetId: retreat.id } },
      })
    : null;

  const dateLabel =
    retreat.startDate &&
    `${new Date(retreat.startDate).toLocaleDateString("it-IT", { day: "numeric", month: "long" })}${
      retreat.endDate && retreat.endDate.getTime() !== retreat.startDate.getTime()
        ? ` – ${new Date(retreat.endDate).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}`
        : ""
    }`;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: retreat.title,
    description: retreat.excerpt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    startDate: retreat.startDate ? retreat.startDate.toISOString() : undefined,
    endDate: retreat.endDate ? retreat.endDate.toISOString() : undefined,
    location: { "@type": "Place", name: retreat.location, address: retreat.location },
    organizer: { "@type": "Organization", name: "Yoga Stargate", url: SITE_URL },
    ...(retreat.price != null
      ? { offers: { "@type": "Offer", price: retreat.price, priceCurrency: "EUR", url: `${SITE_URL}/ritiri/${retreat.slug}` } }
      : {}),
  };

  return (
    <>
      <JsonLd data={eventJsonLd} />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/40 via-primary/10 to-warm-surface" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">{retreat.category}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{retreat.title}</h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/70">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {retreat.location}
            </span>
            {dateLabel && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {dateLabel}
              </span>
            )}
            {retreat.price != null && <span className="font-semibold text-foreground">da €{retreat.price}</span>}
          </div>
          <div className="mt-4 flex justify-center">
            <LevelBadge requiredLevel={retreat.requiredLevel} />
          </div>
        </div>
      </section>

      {firstImage(retreat.images) && (
        <div className="mx-auto -mt-4 max-w-5xl px-4 sm:px-6">
          <div className="relative h-72 overflow-hidden rounded-3xl shadow-soft-lg sm:h-[32rem]">
            <Image src={firstImage(retreat.images)!} alt={retreat.title} fill sizes="(min-width: 1024px) 80vw, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <section className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6">
        {!unlocked ? (
          <>
            <p className="mb-8 text-center text-foreground/70">{retreat.excerpt}</p>
            <LevelLockedNotice requiredLevel={retreat.requiredLevel as number} loggedIn={!!account} />
          </>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <MarkdownContent content={retreat.description} />

              {itinerary.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-heading text-xl font-semibold text-foreground">Programma</h2>
                  <ol className="mt-4 space-y-4">
                    {itinerary.map((day) => (
                      <li key={day.day} className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                          Giorno {day.day}
                        </p>
                        <p className="mt-1 font-heading text-base font-semibold text-foreground">{day.title}</p>
                        <p className="mt-1 text-sm text-foreground/70">{day.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-10">
                <ReviewsSection targetType="RETREAT" targetId={retreat.id} account={account} unlocked={unlocked} />
              </div>
            </div>

            <div className="h-fit space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
                <h2 className="font-heading text-lg font-semibold text-foreground">{retreat.ctaLabel}</h2>
                <p className="mt-2 text-sm text-foreground/70">
                  Compila il modulo e ti risponderemo con tutti i dettagli su disponibilità e modalità di iscrizione.
                </p>
                <div className="mt-5">
                  <LeadForm
                    retreatId={retreat.id}
                    defaultMessage={`Vorrei ricevere informazioni sul ritiro "${retreat.title}".`}
                    submitLabel={retreat.ctaLabel}
                  />
                </div>
              </div>
              <FavoriteButton
                targetType="RETREAT"
                targetId={retreat.id}
                initialFavorited={!!favorite}
                loggedIn={!!account}
              />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
