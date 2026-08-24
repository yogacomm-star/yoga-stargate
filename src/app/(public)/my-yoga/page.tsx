import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/site/Hero";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Metodo",
  description: "Le lezioni settimanali di Yoga Stargate a Milano: mattino, teenager, adulti e livello avanzato.",
  alternates: { canonical: "/my-yoga" },
};

const classes = [
  {
    title: "Lezione del mattino",
    time: "Mercoledì, 9:00 – 10:15",
    description: "Un inizio di giornata dolce e presente, adatto a chi vuole iniziare o mantenere una pratica costante.",
    level: "Tutti i livelli",
  },
  {
    title: "Yoga per teenager",
    time: "Mercoledì, 17:00 – 18:00",
    description: "Uno spazio pensato per ragazze e ragazzi, tra movimento, respiro e primi strumenti di consapevolezza.",
    level: "13-17 anni",
  },
  {
    title: "Livello adulti",
    time: "Mercoledì, 18:15 – 19:30",
    description: "La lezione di riferimento del metodo Yoga Stargate: pratica completa, tra corpo, respiro e meditazione.",
    level: "Base / Intermedio",
  },
  {
    title: "Livello avanzato",
    time: "Mercoledì, 19:45 – 21:00",
    description: "Per chi ha già consolidato le basi e vuole approfondire tecniche più avanzate.",
    level: "Avanzato",
  },
];

const includes = [
  "Piccoli gruppi per un'attenzione reale a ogni persona",
  "Materiale e tappetini disponibili in sala",
  "Possibilità di lezione di prova prima di iscriversi",
  "Percorso graduale con verifica del livello",
];

export default function MyYogaPage() {
  return (
    <>
      <Hero
        eyebrow="Metodo"
        title="Le lezioni settimanali a Milano"
        subtitle="Un punto fermo nella settimana per ritrovare corpo, respiro e presenza, in un piccolo gruppo guidato da Tina Mastandrea."
        primaryCta={{ label: "Prenota una lezione di prova", href: "/contatti" }}
        backgroundImage="/images/lezione-parco-milano.jpeg"
      />

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative h-64 overflow-hidden rounded-2xl shadow-soft-md sm:h-96">
            <Image
              src="/images/cerchio-meditazione-parco.png"
              alt="Cerchio di meditazione in un parco a Milano"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl shadow-soft-md sm:h-96">
            <Image
              src="/images/lezione-parco-milano.jpeg"
              alt="Lezione di yoga all'aperto a Milano"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {classes.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{c.time}</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{c.description}</p>
              <span className="badge-level mt-4">{c.level}</span>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-warm-surface/50 p-8">
          <h2 className="font-heading text-xl font-semibold text-foreground">Cosa include il percorso</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {includes.map((i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {i}
              </li>
            ))}
          </ul>
          <Link
            href="/corsi"
            className="mt-6 inline-flex cursor-pointer items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Esplora anche i corsi online
          </Link>
        </div>
      </section>
    </>
  );
}
