import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/site/Hero";
import { Sparkles, BrainCircuit, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Chi Sono",
  description:
    "Tina Mastandrea, Master Yoga Teacher e fondatrice di Yoga Stargate: la storia e il metodo dietro allo yoga multidimensionale.",
  alternates: { canonical: "/chi-sono" },
};

const pillars = [
  {
    icon: Sparkles,
    title: "Pratica yogica tradizionale",
    text: "Le radici nello yoga classico: respiro, postura, ascolto del corpo come base di ogni percorso.",
  },
  {
    icon: BrainCircuit,
    title: "Neuroscienza applicata",
    text: "Strumenti concreti per comprendere come mente e corpo si riprogrammano attraverso la pratica.",
  },
  {
    icon: HeartHandshake,
    title: "Esplorazione spirituale",
    text: "Uno spazio sicuro per esplorare la propria dimensione interiore, senza dogmi né scorciatoie.",
  },
];

const certifications = [
  { src: "/images/cert-yoga-alliance.jpg", alt: "Yoga Alliance International — Master Teacher, Highest Standards" },
  { src: "/images/cert-yogapros.png", alt: "yogapros — Accredited Senior Yoga Teacher" },
  { src: "/images/cert-csen.jpg", alt: "CSEN — Centro Sportivo Educativo Nazionale" },
];

export default function ChiSonoPage() {
  return (
    <>
      <Hero
        eyebrow="Chi Sono"
        title="Tina Mastandrea"
        subtitle="Master Yoga Teacher e fondatrice di Yoga Stargate — un metodo nato dall'incontro tra pratica yogica, neuroscienza ed esplorazione spirituale."
        backgroundImage="/images/tina-lezione-interno.jpeg"
      />

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative h-[26rem] overflow-hidden rounded-3xl shadow-soft-lg lg:h-[34rem]">
            <Image
              src="/images/tina-crow-pose-spiaggia.png"
              alt="Tina Mastandrea in pratica yoga su una spiaggia"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-4 leading-relaxed text-foreground/80">
            <p>
              Da oltre un decennio accompagno persone di ogni età ed esperienza in un percorso di trasformazione
              attraverso lo yoga. Il mio insegnamento nasce dall&apos;incontro tra la tradizione yogica, che ho
              studiato e praticato per anni, e un approccio più contemporaneo che integra le neuroscienze
              all&apos;esplorazione della coscienza.
            </p>
            <p>
              Yoga Stargate è il nome che ho scelto per raccontare questo percorso: un portale, uno
              &ldquo;stargate&rdquo; appunto, verso una nuova frequenza di consapevolezza. Non un semplice
              allenamento fisico, ma un vero e proprio cammino multidimensionale che tocca corpo, mente ed energia.
            </p>
            <p>
              Insegno ogni settimana a Milano, in Via Zanella 56, e guido ritiri e viaggi spirituali in Italia e nel
              mondo: dalla via micaelica di Assisi ai luoghi sacri del Marocco. Il mio obiettivo è sempre lo stesso:
              offrire strumenti reali, concreti e trasformativi, adatti a chi inizia oggi come a chi pratica da anni.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 text-left shadow-soft-sm">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Certificazioni</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Formazione riconosciuta a livello internazionale
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/70">
            Un percorso di formazione continuo, certificato dai principali enti di riferimento per l&apos;insegnamento
            dello yoga.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
            {certifications.map((c) => (
              <div key={c.src} className="relative h-28 w-28 sm:h-32 sm:w-32">
                <Image src={c.src} alt={c.alt} fill sizes="128px" className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
