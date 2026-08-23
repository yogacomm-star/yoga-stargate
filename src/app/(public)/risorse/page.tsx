import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import { Headphones, BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Risorse",
  description: "Guide gratuite, meditazioni audio e risorse per approfondire la pratica dello Yoga Stargate.",
  alternates: { canonical: "/risorse" },
};

const resources = [
  {
    icon: Headphones,
    title: "7 Giorni per Meditare Bene",
    description: "Sette guide audio gratuite per costruire, giorno dopo giorno, una pratica meditativa stabile.",
    href: "/corsi/sette-giorni-per-meditare-bene",
    cta: "Ascolta gratis",
  },
  {
    icon: BookOpen,
    title: "Yoga Stargate Lezioni — Percorso Base",
    description: "Il corso introduttivo al metodo, pensato per chi muove i primi passi nella pratica.",
    href: "/corsi/yoga-stargate-lezioni-base",
    cta: "Inizia il percorso",
  },
  {
    icon: Sparkles,
    title: "Libreria completa dei corsi",
    description: "Esplora tutti i corsi disponibili, alcuni aperti a tutti e altri riservati per livello.",
    href: "/corsi",
    cta: "Vedi tutti i corsi",
  },
];

export default function RisorsePage() {
  return (
    <>
      <Hero
        eyebrow="Risorse"
        title="Strumenti per la tua pratica"
        subtitle="Guide gratuite e percorsi pensati per accompagnarti, che tu stia iniziando oggi o approfondendo un cammino già avviato."
      />

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {resources.map((r) => (
            <div key={r.title} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-semibold text-foreground">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm text-foreground/70">{r.description}</p>
              <Link href={r.href} className="mt-4 cursor-pointer text-sm font-semibold text-primary">
                {r.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
