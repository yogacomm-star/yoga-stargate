import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, BrainCircuit, Compass, Gift, MapPin, Sparkles, Users } from "lucide-react";
import Hero from "@/components/site/Hero";
import BlogCard, { type BlogCardData } from "@/components/site/BlogCard";
import TestimonialCarousel from "@/components/site/TestimonialCarousel";
import ScrollCarousel from "@/components/site/ScrollCarousel";
import FaqSection from "@/components/site/FaqSection";
import JsonLd from "@/components/site/JsonLd";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/images";
import { SITE_URL } from "@/lib/site";

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: "Yoga Stargate",
  description:
    "Scuola di yoga multidimensionale a Milano fondata da Tina Mastandrea: eventi dal vivo, percorsi online, ritiri e viaggi in Italia e nel mondo.",
  url: SITE_URL,
  telephone: "+39 333 698 0044",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rimembranze di Lambrate 16",
    addressLocality: "Milano",
    addressCountry: "IT",
  },
  sameAs: ["https://instagram.com", "https://facebook.com"],
  founder: { "@type": "Person", name: "Tina Mastandrea" },
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

export default async function HomePage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = { OR: [{ startDate: { gte: startOfToday } }, { startDate: null }] };

  const [posts, nextRetreat, nextMasterclass, nextWorkshop, publishedCourses, purchaseCounts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    // Prossimo ritiro/viaggio: gli appuntamenti di Milano (masterclass, workshop, sessioni)
    // hanno il loro riquadro a parte.
    prisma.retreat.findFirst({
      where: {
        status: "PUBLISHED",
        startDate: { gte: startOfToday },
        NOT: { category: { in: ["Masterclass", "Workshop", "Sessione individuale"] } },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.retreat.findFirst({
      where: { status: "PUBLISHED", category: "Masterclass", ...upcoming },
      orderBy: { startDate: "asc" },
    }),
    prisma.retreat.findFirst({
      where: { status: "PUBLISHED", category: "Workshop", ...upcoming },
      orderBy: { startDate: "asc" },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED", NOT: { category: "Risorsa gratuita" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.coursePurchase.groupBy({
      by: ["courseId"],
      _count: { courseId: true },
    }),
  ]);

  // Percorso online "più scelto": quello con più acquisti, altrimenti il più recente.
  const counts = new Map(purchaseCounts.map((p) => [p.courseId, p._count.courseId]));
  // In evidenza "La Via della Meditazione" (scelta della cliente) finché è pubblicata; altrimenti
  // il percorso con più acquisti.
  const featuredCourse = publishedCourses.find((c) => c.slug === "la-via-della-meditazione") ?? null;
  const topCourse =
    featuredCourse ??
    [...publishedCourses].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))[0] ??
    null;
  const topCourseText = featuredCourse
    ? "Un testo e percorso di iniziazione alla meditazione per trasformare la vita in un'avventura di realizzazione di Sé."
    : topCourse?.excerpt ?? "Pratiche guidate, rituali di trasformazione ed ebook da vivere dove vuoi, quando vuoi.";

  const blogCards: BlogCardData[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt,
    author: p.author,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    readTimeMinutes: p.readTimeMinutes,
    image: p.featuredImage,
  }));

  const retreatDate = formatDate(nextRetreat?.startDate ? nextRetreat.startDate.toISOString() : null);
  const retreatImage = (nextRetreat ? firstImage(nextRetreat.images) : null) ?? "/images/ritiro-assisi-terrazza.png";
  const topCourseImage = topCourse?.coverImage ?? "/images/yoga-multidimensionale-spiaggia.png";

  return (
    <>
      <JsonLd data={businessJsonLd} />
      <Hero
        align="left"
        backgroundImage="/images/hero-meditazione-arcobaleno.jpg"
        // La foto ritrae Tina spostata verso destra: object-position di default (centrato)
        // la taglia fuori dall'inquadratura sui riquadri stretti e alti come i cellulari.
        imagePosition="78% 20%"
        eyebrow="Yoga e Discipline Multidimensionali"
        title="Attiva la Nuova Frequenza"
        subtitle="Il metodo che unisce la tradizione yogica e le neuroscienze per il risveglio interiore e l'espansione di coscienza."
        primaryCta={{ label: "Inizia ora — percorso online gratis", href: "/corsi/sette-giorni-per-meditare-bene" }}
        secondaryCta={{ label: "Scopri di più", href: "#scegli" }}
      />

      <section className="relative overflow-hidden bg-primary py-20 text-center text-white">
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            Regalo per te, gratis
          </span>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Scarica il tuo Dono per l&apos;Anima</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Om Shaant — il percorso online guidato da Tina Mastandrea, per il tuo risveglio interiore.
            Sperimenti rilassamento profondo, rinnovamento integrale e nuova frequenza. Gratuito per chi si
            registra a Yoga Stargate.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/corsi/sette-giorni-per-meditare-bene"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-accent-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
            >
              <Gift className="h-4 w-4" aria-hidden="true" />
              Voglio il mio dono
            </Link>
          </div>
        </div>
      </section>

      {/* Box scorrevoli con inviti agli eventi */}
      <section id="scegli" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">I prossimi appuntamenti</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Scegli quello che ti risuona
        </h2>

        <ScrollCarousel className="mt-8" itemClassName="w-[85vw] min-w-0 sm:w-[340px] first:w-[92vw] sm:first:w-[440px]" ariaLabel="Prossimi appuntamenti">
          {/* Masterclass a Milano */}
          <EventTeaser
            image={(nextMasterclass ? firstImage(nextMasterclass.images) : null) ?? "/images/lezione-parco-milano.jpeg"}
            badge="Milano"
            title={nextMasterclass?.title ?? "Yoga Masterclass Milano"}
            text={
              nextMasterclass?.excerpt ??
              "Approfondisci e impara nuove pratiche di risveglio — 21 ottobre, ore 17. Un'esperienza accessibile e pensata per un lavoro efficace e trasformativo. Posti sempre limitati."
            }
            href={nextMasterclass ? `/eventi/${nextMasterclass.slug}` : "/eventi?categoria=Masterclass"}
            cta="Scopri la Masterclass"
          />

          {/* Workshop a Milano */}
          <EventTeaser
            image={(nextWorkshop ? firstImage(nextWorkshop.images) : null) ?? "/images/cerchio-meditazione-parco.png"}
            badge="Milano"
            title={nextWorkshop?.title ?? "Yoga Workshop"}
            text={
              nextWorkshop?.excerpt ??
              "Mercoledì 4/11 dalle ore 17 entri nel cuore del metodo Yoga Stargate Multidimensionale e integri, armonizzi e rinforzi corpo, energia, visione e nuova coscienza."
            }
            href={nextWorkshop ? `/eventi/${nextWorkshop.slug}` : "/eventi?categoria=Workshop"}
            cta="Scopri il Workshop"
          />

          {/* Prossimo ritiro */}
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-44 w-full shrink-0">
              <Image src={retreatImage} alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Prossimo ritiro
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Se cerchi silenzio e natura, questo è per Te
              </h3>
              {nextRetreat ? (
                <p className="mt-2 text-sm text-foreground/70">
                  <strong>{nextRetreat.title}</strong> — {nextRetreat.location}
                  {retreatDate ? ` · dal ${retreatDate}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-foreground/70">
                  Mental reset, riconnessione al sé, formazione: scopri le prossime destinazioni dei ritiri Yoga Stargate,
                  in Italia e nel mondo.
                </p>
              )}
              <div className="mt-auto pt-3">
                <Link
                  href={nextRetreat ? `/eventi/${nextRetreat.slug}` : "/eventi"}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
                >
                  Partecipa al Ritiro
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Percorso online in evidenza */}
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-44 w-full shrink-0">
              <Image src={topCourseImage} alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Il più scelto
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {topCourse ? topCourse.title : "Percorsi Online Yoga Stargate"}
              </h3>
              <p className="mt-2 text-sm text-foreground/70">{topCourseText}</p>
              <div className="mt-auto pt-3">
                <Link
                  href={topCourse ? `/corsi/${topCourse.slug}` : "/corsi"}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
                >
                  Inizia il percorso online
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Gruppi e ritiri privati */}
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-44 w-full shrink-0">
              <Image src="/images/gruppo-viaggio-india.jpeg" alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" aria-hidden="true" /> Gruppi &amp; aziende
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Hai un gruppo? Organizza un ritiro con Tina
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                Lezioni ed esperienze private su misura, guidate da Tina Mastandrea, nel luogo e nel periodo che
                preferite.
              </p>
              <div className="mt-auto pt-3">
                <Link
                  href="/eventi#gruppi"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
                >
                  Scrivici per il tuo gruppo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollCarousel>
      </section>

      {/* Chi guida il percorso */}
      <section className="bg-card py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* Riquadro verticale con lo stesso rapporto della foto (2:3): con object-cover non
              viene tagliato nulla, nemmeno il viso. Un riquadro basso e largo la ritagliava. */}
          <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-3xl bg-muted lg:mx-0">
            <Image
              src="/images/tina-crow-pose-spiaggia.png"
              alt="Tina Mastandrea in pratica yoga su una spiaggia"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Chi guida il percorso</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Tina Mastandrea</h2>
            <p className="mt-2 font-heading text-lg font-medium text-primary">Master Yoga Teacher International</p>
            <p className="mt-4 text-foreground/70">
              Fondatrice di Yoga Stargate, Tina guida uno yoga contemporaneo che unisce la tradizione yogica alle
              neuroscienze. Accompagna manager, professionisti, coach, ricercatori spirituali e insegnanti verso una
              nuova frequenza di consapevolezza: strumenti concreti, pratica profonda, risultati reali.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="badge-level">
                <Award className="h-3.5 w-3.5" aria-hidden="true" /> Master Yoga Teacher International
              </span>
              <span className="badge-level">
                <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" /> Tradizione yogica + Neuroscienze
              </span>
              <span className="badge-level">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Yoga contemporaneo
              </span>
            </div>
            <Link
              href="/chi-sono"
              className="mt-6 inline-flex cursor-pointer items-center gap-1 text-base font-semibold text-primary"
            >
              Leggi la sua storia
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <TestimonialCarousel />
        </div>
      </section>

      {blogCards.length > 0 && (
        <section className="bg-muted/40 py-24">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Dal blog</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground">Approfondimenti e pratiche</h2>
            <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
              {blogCards.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
            <Link href="/blog" className="mt-8 inline-block cursor-pointer text-base font-semibold text-primary">
              Vedi tutti gli articoli →
            </Link>
          </div>
        </section>
      )}

      <FaqSection />

      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Pronta o pronto ad attivare la nuova frequenza?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-foreground/70">
          Scegli una masterclass o un workshop a Milano, inizia un percorso online o parti con noi per il
          prossimo ritiro.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/eventi"
            className="cursor-pointer rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
          >
            Scopri gli Eventi
          </Link>
          <Link
            href="/registrati"
            className="cursor-pointer rounded-full border border-border bg-card px-7 py-3 text-base font-semibold text-primary shadow-soft-md transition-transform hover:-translate-y-0.5"
          >
            Crea il tuo account
          </Link>
        </div>
      </section>
    </>
  );
}

// Riquadro del carosello "I prossimi appuntamenti" per gli eventi di Milano (masterclass,
// workshop). Mostra l'evento vero, se Tina l'ha già pubblicato dal pannello Eventi; altrimenti
// il testo di presentazione, con il link alla categoria giusta della pagina Eventi.
function EventTeaser({
  image,
  badge,
  title,
  text,
  href,
  cta,
}: {
  image: string;
  badge: string;
  title: string;
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft-sm">
      <div className="relative h-44 w-full shrink-0">
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 line-clamp-5 text-sm text-foreground/70">{text}</p>
        <div className="mt-auto pt-3">
          <Link
            href={href}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
          >
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
