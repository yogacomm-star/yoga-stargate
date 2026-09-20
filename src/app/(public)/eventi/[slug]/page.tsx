import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, CalendarDays, CheckCircle2, Ticket, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/auth";
import { canAccess } from "@/lib/levels";
import { LevelBadge, LevelLockedNotice } from "@/components/site/LevelLock";
import EventSections from "@/components/site/EventSections";
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

  const hasPrice = retreat.price != null && retreat.price > 0;
  const chip = "inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm text-foreground/80 backdrop-blur-sm";

  return (
    <>
      <JsonLd data={eventJsonLd} />
      {retreat.status === "DRAFT" && <DraftPreviewBanner />}

      {/* Intestazione: testo a sinistra, copertina a destra (riquadro 4:3, lo stesso rapporto del
          ritaglio dal pannello admin, quindi la foto si vede intera). Senza copertina il testo
          resta centrato. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-secondary/40 via-primary/10 to-warm-surface" />
        <div
          className={`mx-auto max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 ${
            cover ? "grid lg:grid-cols-[1.05fr_1fr] lg:items-center" : "max-w-4xl text-center"
          }`}
        >
          <div className={cover ? "text-center lg:text-left" : ""}>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">{retreat.category}</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
              {retreat.title}
            </h1>
            <div className={`mt-6 flex flex-wrap gap-2.5 ${cover ? "justify-center lg:justify-start" : "justify-center"}`}>
              <span className={chip}>
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {retreat.location}
              </span>
              {dateLabel && (
                <span className={chip}>
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                  {dateLabel}
                </span>
              )}
              {retreat.price != null && (
                <span className={chip + " font-semibold text-foreground"}>
                  <Ticket className="h-4 w-4 text-primary" aria-hidden="true" />
                  da €{retreat.price}
                </span>
              )}
            </div>
            <div className={`mt-4 flex ${cover ? "justify-center lg:justify-start" : "justify-center"}`}>
              <LevelBadge requiredLevel={retreat.requiredLevel} />
            </div>
            {unlocked && (
              <div className={`mt-7 flex flex-wrap items-center gap-3 ${cover ? "justify-center lg:justify-start" : "justify-center"}`}>
                {!isPast && (
                  <a
                    href="#prenota"
                    className="inline-flex cursor-pointer items-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
                  >
                    {canPay ? "Prenota il tuo posto" : retreat.ctaLabel}
                  </a>
                )}
                <FavoriteButton
                  targetType="RETREAT"
                  targetId={retreat.id}
                  initialFavorited={!!favorite}
                  loggedIn={!!account}
                />
              </div>
            )}
          </div>

          {cover && (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-soft-lg lg:max-w-none">
              <Image src={cover} alt={retreat.title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" priority />
            </div>
          )}
        </div>
      </section>

      {!unlocked ? (
        <section className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6">
          <p className="mb-8 text-center text-foreground/70">{retreat.excerpt}</p>
          <LevelLockedNotice requiredLevel={retreat.requiredLevel as number} loggedIn={!!account} />
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
            <EventSections content={retreat.description} lead={retreat.excerpt} />
          </section>

          {retreat.videoUrl && isAllowedEmbedUrl(retreat.videoUrl) && (
            <section className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
              <div className="aspect-video overflow-hidden rounded-3xl border border-border shadow-soft-md">
                <iframe
                  src={retreat.videoUrl}
                  title={retreat.title}
                  className="h-full w-full"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </section>
          )}

          {photos.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
              {/* Colonne (non griglia a riquadri fissi): ogni foto mantiene le sue proporzioni
                  originali, quindi nessun viso o dettaglio viene tagliato. */}
              <div className={`gap-4 ${photos.length === 1 ? "mx-auto max-w-3xl" : "columns-1 sm:columns-2 lg:columns-3"}`}>
                {photos.map((src) => (
                  <div key={src} className="mb-4 break-inside-avoid overflow-hidden rounded-3xl shadow-soft-md">
                    <Image
                      src={src}
                      alt=""
                      width={1200}
                      height={900}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {itinerary.length > 0 && (
            <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
              <h2 className="text-center font-heading text-2xl font-semibold text-foreground sm:text-3xl">Programma</h2>
              <ol className="relative mt-8 ml-4 space-y-5 border-l-2 border-primary/20 pl-8">
                {itinerary.map((day) => (
                  <li key={day.day} className="relative">
                    <span className="absolute top-4 -left-[3.175rem] flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground shadow-soft-sm">
                      {day.day}
                    </span>
                    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">Giorno {day.day}</p>
                      <p className="mt-1 font-heading text-lg font-semibold text-foreground">{day.title}</p>
                      <ScheduleText text={day.description} className="mt-1 text-base text-foreground/70" />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
            <h2 className="mb-6 text-center font-heading text-2xl font-semibold text-foreground sm:text-3xl">Testimonianze</h2>
            <TestimonialCarousel />
          </section>

          <section id="prenota" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14 pb-24 sm:px-6">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft-sm sm:p-10">
              {prenotazione === "riuscita" && (
                <div className="mb-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm text-foreground/80">
                    <strong>Prenotazione ricevuta, grazie!</strong> Ti abbiamo scritto una email di conferma; a breve
                    riceverai anche tutti i dettagli pratici.
                  </p>
                </div>
              )}
              {prenotazione === "annullata" && (
                <p className="mb-8 rounded-2xl border border-border bg-muted p-4 text-sm text-foreground/70">
                  Il pagamento è stato annullato: nessun addebito. Puoi riprovare quando vuoi.
                </p>
              )}

              <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                    {isPast ? "Evento concluso" : "Prenota il tuo posto"}
                  </h2>
                  <p className="mt-3 text-foreground/70">
                    {isPast
                      ? "Questo appuntamento si è già svolto. Lascia i tuoi dati: ti avviseremo quando ci sarà una nuova data."
                      : canPay
                        ? "Puoi prenotare subito con pagamento sicuro online, oppure scriverci per chiedere prima qualche informazione. I posti sono limitati."
                        : "Compila il modulo e ti risponderemo con tutti i dettagli su disponibilità e modalità di iscrizione."}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm text-foreground/80">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {retreat.location}
                    </li>
                    {dateLabel && (
                      <li className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> {dateLabel}
                      </li>
                    )}
                    {hasPrice && (
                      <li className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> €{retreat.price}
                      </li>
                    )}
                    {!isPast && (
                      <li className="flex items-center gap-2">
                        <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> Posti limitati
                      </li>
                    )}
                  </ul>

                  {!isPast && canPay && retreat.price != null && (
                    <div className="mt-7">
                      <BookEventButton retreatId={retreat.id} price={retreat.price} />
                    </div>
                  )}
                  {!isPast && retreat.ctaUrl && (
                    <a
                      href={retreat.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex cursor-pointer items-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
                    >
                      {retreat.ctaLabel}
                    </a>
                  )}
                </div>

                <div>
                  {!isPast && (canPay || retreat.ctaUrl) && (
                    <h3 className="mb-3 font-heading text-base font-semibold text-foreground">
                      Preferisci prima parlarne? Scrivici
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
            </div>
          </section>
        </>
      )}
    </>
  );
}
