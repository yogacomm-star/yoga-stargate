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
    "Scuola di yoga multidimensionale a Milano fondata da Tina Mastandrea: percorsi live, percorsi online e ritiri e viaggi in Italia e nel mondo.",
  url: SITE_URL,
  telephone: "+39 333 698 0044",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Zanella 56",
    addressLocality: "Milano",
    addressCountry: "IT",
  },
  sameAs: ["https://instagram.com", "https://facebook.com"],
  founder: { "@type": "Person", name: "Tina Mastandrea" },
};

const schedule = [
  { day: "Mercoledì", time: "9:00 – 10:15", label: "Lezione del mattino" },
  { day: "Mercoledì", time: "17:00 – 18:00", label: "Yoga per teenager" },
  { day: "Mercoledì", time: "18:15 – 19:30", label: "Livello adulti" },
  { day: "Mercoledì", time: "19:45 – 21:00", label: "Livello avanzato" },
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

export default async function HomePage() {
  const [posts, nextRetreat, publishedCourses, purchaseCounts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.retreat.findFirst({
      where: { status: "PUBLISHED", startDate: { gte: new Date() } },
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
  const topCourse =
    [...publishedCourses].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))[0] ?? null;

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
        eyebrow="Il metodo di Yoga Multidimensionale"
        title="Yoga Stargate: Attiva la tua Nuova Frequenza"
        subtitle="Il metodo di Tina Mastandrea, Master Yoga Teacher International, che unisce la tradizione yogica alle neuroscienze per il tuo risveglio interiore."
        primaryCta={{ label: "Inizia ora — 7 meditazioni gratis", href: "/corsi/sette-giorni-per-meditare-bene" }}
        secondaryCta={{ label: "Scopri il metodo", href: "/metodo" }}
      />

      <section className="relative overflow-hidden bg-primary py-16 text-center text-white">
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            Regalo per te, gratis
          </span>
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Scarica il tuo Dono per l&apos;Anima</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            7 giorni, 7 meditazioni audio guidate da Tina Mastandrea per iniziare (o ritrovare) una pratica
            quotidiana che ti fa stare bene. Gratuito per chi si registra a Yoga Stargate.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/corsi/sette-giorni-per-meditare-bene"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-7 py-3 text-base font-semibold text-accent-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
            >
              <Gift className="h-4 w-4" aria-hidden="true" />
              Voglio il mio dono
            </Link>
          </div>
        </div>
      </section>

      {/* Box scorrevoli con inviti agli eventi */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">I prossimi appuntamenti</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Scegli da dove iniziare
        </h2>

        <ScrollCarousel className="mt-8" itemClassName="min-w-[80%] sm:min-w-[46%] lg:min-w-[30%]" ariaLabel="Prossimi appuntamenti">
          {/* Percorsi Live a Milano */}
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-40 w-full shrink-0">
              <Image src="/images/lezione-parco-milano.jpeg" alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Milano · Via Zanella 56
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">Percorsi Live — Prova una lezione</h3>
              <p className="mt-2 text-sm text-foreground/70">
                Percorsi di 4 lezioni con un tema specifico, in piccoli gruppi. La lezione di prova costa 20€.
              </p>
              <ul className="mt-4 space-y-1.5">
                {schedule.map((s) => (
                  <li key={s.label} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">{s.label}</span>
                    <span className="shrink-0 text-foreground/60">{s.day} · {s.time}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4">
                <Link
                  href="/my-yoga"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
                >
                  Prenota la lezione di prova
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Prossimo ritiro */}
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-40 w-full shrink-0">
              <Image src={retreatImage} alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Prossimo ritiro
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Se cerchi silenzio e natura, questo è il tuo momento
              </h3>
              {nextRetreat ? (
                <p className="mt-2 text-sm text-foreground/70">
                  <strong>{nextRetreat.title}</strong> — {nextRetreat.location}
                  {retreatDate ? ` · dal ${retreatDate}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm text-foreground/70">
                  Mental reset, riconnessione al sé, formazione: scopri le prossime destinazioni dei ritiri Yoga Stargate.
                </p>
              )}
              <div className="mt-auto pt-4">
                <Link
                  href={nextRetreat ? `/ritiri/${nextRetreat.slug}` : "/ritiri"}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
                >
                  Partecipa al prossimo ritiro
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Percorso online in evidenza */}
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-40 w-full shrink-0">
              <Image src={topCourseImage} alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Il più scelto
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {topCourse ? topCourse.title : "Percorsi Online Yoga Stargate"}
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                {topCourse
                  ? topCourse.excerpt
                  : "Pratiche guidate, rituali di trasformazione ed ebook da vivere dove vuoi, quando vuoi."}
              </p>
              <div className="mt-auto pt-4">
                <Link
                  href={topCourse ? `/corsi/${topCourse.slug}` : "/corsi"}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
                >
                  Inizia il percorso online
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Gruppi e ritiri privati */}
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm">
            <div className="relative h-40 w-full shrink-0">
              <Image src="/images/gruppo-viaggio-india.jpeg" alt="" fill sizes="(min-width: 1024px) 40vw, 88vw" className="object-cover" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" aria-hidden="true" /> Gruppi &amp; aziende
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Hai un gruppo? Organizza un ritiro con Tina
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                Lezioni ed esperienze private su misura, guidate da Tina Mastandrea — Master Yoga Teacher International —
                nel luogo e nel periodo che preferite.
              </p>
              <div className="mt-auto pt-4">
                <Link
                  href="/ritiri#gruppi"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
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
      <section className="bg-card py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-muted">
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
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Dal blog</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground">Riflessioni e pratiche</h2>
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

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Pronta o pronto ad attivare la tua nuova frequenza?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-foreground/70">
          Prova una lezione dei Percorsi Live a Milano, inizia un percorso online o parti con noi per il prossimo
          ritiro.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/ritiri"
            className="cursor-pointer rounded-lg bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
          >
            Scopri Ritiri &amp; Viaggi
          </Link>
          <Link
            href="/registrati"
            className="cursor-pointer rounded-lg border-2 border-primary px-7 py-3 text-base font-semibold text-primary transition-transform hover:-translate-y-0.5"
          >
            Crea il tuo account
          </Link>
        </div>
      </section>
    </>
  );
}
