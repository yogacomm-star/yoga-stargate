import Link from "next/link";
import Image from "next/image";
import { Sunrise, Flame, Compass, GraduationCap, ArrowRight } from "lucide-react";
import Hero from "@/components/site/Hero";
import BlogCard, { type BlogCardData } from "@/components/site/BlogCard";
import TestimonialCarousel from "@/components/site/TestimonialCarousel";
import { Gift } from "lucide-react";
import JsonLd from "@/components/site/JsonLd";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: "Yoga Stargate",
  description:
    "Scuola di yoga multidimensionale a Milano fondata da Tina Mastandrea: lezioni settimanali, corsi online e ritiri in Italia e nel mondo.",
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

const pathways = [
  {
    icon: Sunrise,
    title: "My Yoga — Lezioni",
    description: "Il percorso base per costruire una pratica solida: respiro, postura e presenza.",
    href: "/my-yoga",
  },
  {
    icon: Flame,
    title: "Rituali di Trasformazione",
    description: "Pratiche rituali immersive per chi vuole andare più a fondo nel cambiamento.",
    href: "/corsi",
  },
  {
    icon: Compass,
    title: "Ritiri",
    description: "Esperienze immersive in Italia e nel mondo, per riattivare la tua frequenza.",
    href: "/ritiri",
  },
  {
    icon: GraduationCap,
    title: "Corsi & Percorsi",
    description: "Una libreria di corsi, alcuni aperti a tutti, altri riservati per livello.",
    href: "/corsi",
  },
];

const schedule = [
  { day: "Mercoledì", time: "9:00 – 10:15", label: "Lezione del mattino" },
  { day: "Mercoledì", time: "17:00 – 18:00", label: "Yoga per teenager" },
  { day: "Mercoledì", time: "18:15 – 19:30", label: "Livello adulti" },
  { day: "Mercoledì", time: "19:45 – 21:00", label: "Livello avanzato" },
];

export default async function HomePage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

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

  return (
    <>
      <JsonLd data={businessJsonLd} />
      <Hero
        eyebrow="Yoga Multidimensionale"
        title="Attiva la tua nuova frequenza"
        subtitle="Yoga Stargate è il percorso di Tina Mastandrea che unisce pratica yogica, neuroscienza ed esplorazione spirituale per un risveglio interiore reale, passo dopo passo."
        primaryCta={{ label: "Inizia ora", href: "/ritiri" }}
        secondaryCta={{ label: "Scopri il metodo", href: "/chi-sono" }}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[#0c4a6e] py-16 text-center text-white">
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
            >
              <Gift className="h-4 w-4" aria-hidden="true" />
              Voglio il mio dono
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pathways.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-6 shadow-soft-sm transition-transform hover:-translate-y-1 hover:shadow-soft-md"
            >
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-foreground/70">{p.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Scopri di più
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="relative h-96 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/50 via-primary/20 to-warm-surface">
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
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground">Tina Mastandrea</h2>
            <p className="mt-4 text-foreground/70">
              Master Yoga Teacher e fondatrice di Yoga Stargate, Tina unisce la tradizione yogica a un approccio
              multidimensionale che intreccia neuroscienza ed esplorazione spirituale. Da anni accompagna allieve e
              allievi verso una pratica più consapevole, in aula a Milano e nei ritiri in Italia e nel mondo.
            </p>
            <Link
              href="/chi-sono"
              className="mt-5 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary"
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

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">Lezioni a Milano</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground">Gli orari settimanali</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {schedule.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{s.day}</p>
              <p className="mt-2 font-heading text-lg font-semibold text-foreground">{s.time}</p>
              <p className="mt-1 text-sm text-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/api/calendar/lezioni.ics" className="cursor-pointer text-sm font-semibold text-primary">
            Aggiungi al calendario
          </a>
          <Link href="/contatti" className="cursor-pointer text-sm font-semibold text-primary">
            Vieni a trovarci in Via Zanella 56 →
          </Link>
        </div>
      </section>

      {blogCards.length > 0 && (
        <section className="bg-warm-surface/40 py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Dal blog</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold text-foreground">Riflessioni e pratiche</h2>
            <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
              {blogCards.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
            <Link href="/blog" className="mt-8 inline-block cursor-pointer text-sm font-semibold text-primary">
              Vedi tutti gli articoli →
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          Pronta o pronto ad attivare la tua nuova frequenza?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-foreground/70">
          Scopri i prossimi ritiri, iscriviti a un corso o vieni a fare pratica con noi a Milano.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/ritiri"
            className="cursor-pointer rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
          >
            Scopri i ritiri
          </Link>
          <Link
            href="/registrati"
            className="cursor-pointer rounded-lg border-2 border-primary px-7 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
          >
            Crea il tuo account
          </Link>
        </div>
      </section>
    </>
  );
}
