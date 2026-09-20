import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/auth";
import { canAccess } from "@/lib/levels";
import { LevelBadge, LevelLockedNotice } from "@/components/site/LevelLock";
import { SectionedContent } from "@/components/site/MarkdownContent";
import ScheduleText from "@/components/site/ScheduleText";
import LeadForm from "@/components/site/LeadForm";
import BookEventButton from "@/components/site/BookEventButton";
import FavoriteButton from "@/components/site/FavoriteButton";
import TestimonialCarousel from "@/components/site/TestimonialCarousel";
import JsonLd from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";
import { isAllowedEmbedUrl } from "@/lib/embed";
import DraftPreviewBanner from "@/components/site/DraftPreviewBanner";

type Itinerary = { day: number; title: string; description: string }[];

function parseItinerary(raw: string): Itinerary {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function parseImages(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((u): u is string => typeof u === "string") : [];
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
    alternates: { canonical: `/eventi/${retreat.slug}` },
    openGraph: { title: retreat.title, description: retreat.excerpt, type: "website" },
  };
}

export default async function RetreatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ prenotazione?: string }>;
}) {
  const { slug } = await params;
  const { prenotazione } = await searchParams;
  const retreat = await getRetreat(slug);
  const account = await getCurrentAccount();
  // Le bozze restano invisibili a chiunque tranne l'admin: gli permette di aprire l'indirizzo
  // pubblico vero e proprio per vedere come apparirà il ritiro prima ancora di pubblicarlo.
  if (!retreat || (retreat.status !== "PUBLISHED" && account?.role !== "ADMIN")) notFound();

  const unlocked = canAccess(retreat.requiredLevel, account?.level);
  const itinerary = parseItinerary(retreat.itinerary);
  const images = parseImages(retreat.images);
  const cover = images[0] ?? null;
  const photos = images.slice(1);

  // Evento già concluso: niente pagamento, resta la possibilità di chiedere informazioni
  // (per la prossima edizione).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDay = retreat.endDate ?? retreat.startDate;
  const isPast = !!lastDay && lastDay < today;
  const canPay = retreat.price != null && retreat.price > 0 && !retreat.ctaUrl && !isPast;

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
      ? { offers: { "@type": "Offer", price: retreat.price, priceCurrency: "EUR", url: `${SITE_URL}/eventi/${retreat.slug}` } }
      : {}),
  };

  return (
    <>
      <JsonLd data={eventJsonLd} />
      {retreat.status === "DRAFT" && <DraftPreviewBanner />}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/40 via-primary/10 to-warm-surface" />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
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
          {unlocked && !isPast && (
            <a
              href="#prenota"
              className="mt-6 inline-flex cursor-pointer items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
            >
              {canPay ? "Prenota il tuo posto" : retreat.ctaLabel}
            </a>
          )}
        </div>
      </section>

      {cover && (
        <div className="mx-auto -mt-4 max-w-3xl px-4 sm:px-6">
          {/* Riquadro 4:3, lo stesso rapporto del ritaglio dal pannello admin: la copertina si
              vede intera, senza tagli. */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft-lg">
            <Image src={cover} alt={retreat.title} fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" priority />
          </div>
        </div>
      )}

      <section className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6">
        {!unlocked ? (
          <>
            <p className="mb-8 text-center text-foreground/70">{retreat.excerpt}</p>
            <LevelLockedNotice requiredLevel={retreat.requiredLevel as number} loggedIn={!!account} />
          </>
        ) : (
          <>
            {/* Il contenuto usa sempre tutta la larghezza (niente più colonna laterale
                alta quanto il resto della pagina, che lasciava un vuoto enorme non appena
                il modulo, più corto, finiva prima del testo). Il modulo di richiesta sta
                in fondo, dopo tutte le informazioni sul ritiro. */}
            <div className="flex justify-end">
              <FavoriteButton
                targetType="RETREAT"
                targetId={retreat.id}
                initialFavorited={!!favorite}
                loggedIn={!!account}
              />
            </div>

            <div className="mt-6">
              <SectionedContent content={retreat.description} />
            </div>

            {retreat.videoUrl && isAllowedEmbedUrl(retreat.videoUrl) && (
              <div className="mt-10 aspect-video overflow-hidden rounded-3xl border border-border shadow-soft-sm">
                <iframe
                  src={retreat.videoUrl}
                  title={retreat.title}
                  className="h-full w-full"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            )}

            {itinerary.length > 0 && (
              <div className="mt-10">
                <h2 className="font-heading text-xl font-semibold text-foreground">Programma</h2>
                <ol className="mt-4 space-y-4">
                  {itinerary.map((day) => (
                    <li key={day.day} className="rounded-3xl border border-border bg-card p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                        Giorno {day.day}
                      </p>
                      <p className="mt-1 font-heading text-base font-semibold text-foreground">{day.title}</p>
                      <ScheduleText text={day.description} className="mt-1 text-base text-foreground/70" />
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-10">
                <h2 className="font-heading text-xl font-semibold text-foreground">Le foto</h2>
                {/* Colonne (non griglia a riquadri fissi): ogni foto mantiene le sue proporzioni
                    originali, quindi nessun viso o dettaglio viene tagliato. */}
                <div className="mt-4 columns-1 gap-4 sm:columns-2">
                  {photos.map((src) => (
                    <div key={src} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-border">
                      <Image
                        src={src}
                        alt=""
                        width={1200}
                        height={900}
                        sizes="(min-width: 768px) 24rem, 100vw"
                        className="h-auto w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <h2 className="mb-6 font-heading text-xl font-semibold text-foreground">Testimonianze</h2>
              <TestimonialCarousel />
            </div>

            <div id="prenota" className="mt-10 scroll-mt-24 rounded-3xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
              {prenotazione === "riuscita" && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm text-foreground/80">
                    <strong>Prenotazione ricevuta, grazie!</strong> Ti abbiamo scritto una email di conferma; a breve
                    riceverai anche tutti i dettagli pratici.
                  </p>
                </div>
              )}
              {prenotazione === "annullata" && (
                <p className="mb-6 rounded-2xl border border-border bg-muted p-4 text-sm text-foreground/70">
                  Il pagamento è stato annullato: nessun addebito. Puoi riprovare quando vuoi.
                </p>
              )}

              {isPast ? (
                <>
                  <h2 className="font-heading text-lg font-semibold text-foreground">Evento concluso</h2>
                  <p className="mt-2 max-w-md text-sm text-foreground/70">
                    Questo appuntamento si è già svolto. Lascia i tuoi dati: ti avviseremo quando ci sarà una nuova
                    data.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-lg font-semibold text-foreground">Prenota il tuo posto</h2>
                  <p className="mt-2 max-w-md text-sm text-foreground/70">
                    {canPay
                      ? "Puoi prenotare subito con pagamento sicuro online, oppure scriverci per chiedere prima qualche informazione. I posti sono limitati."
                      : "Compila il modulo e ti risponderemo con tutti i dettagli su disponibilità e modalità di iscrizione."}
                  </p>
                  {canPay && retreat.price != null && (
                    <div className="mt-5">
                      <BookEventButton retreatId={retreat.id} price={retreat.price} />
                    </div>
                  )}
                  {retreat.ctaUrl && (
                    <a
                      href={retreat.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex cursor-pointer items-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
                    >
                      {retreat.ctaLabel}
                    </a>
                  )}
                </>
              )}

              <div className={`${isPast ? "mt-5" : "mt-8 border-t border-border pt-6"} max-w-lg`}>
                {!isPast && (
                  <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
                    {canPay || retreat.ctaUrl ? "Preferisci prima parlarne? Scrivici" : retreat.ctaLabel}
                  </h3>
                )}
                <LeadForm
                  retreatId={retreat.id}
                  defaultMessage={`Vorrei ricevere informazioni su "${retreat.title}".`}
                  submitLabel={canPay || retreat.ctaUrl ? "Richiedi informazioni" : retreat.ctaLabel}
                  source="Richiesta evento"
                />
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
