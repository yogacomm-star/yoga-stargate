import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import { ArrowRight, Sparkles, BrainCircuit, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Chi Sono",
  description:
    "Tina Mastandrea: Master Yoga Teacher, creatrice del metodo Yoga Stargate, guida spirituale e formatrice internazionale dedicata al risveglio dell'anima.",
  alternates: { canonical: "/chi-sono" },
};

const offerings = [
  {
    title: "Formazione Yoga Stargate",
    text: "Percorsi evolutivi e professionali attraverso i 4 processi del metodo, per chi sente la chiamata a una trasformazione profonda e radicata.",
  },
  {
    title: "Ritiri e esperienze immersive",
    text: "Spazi sacri di rigenerazione, guarigione e attivazione, in presenza con gruppi in evoluzione.",
  },
  {
    title: "Trasmissioni di luce e meditazioni multidimensionali",
    text: "Pratiche energetiche per elevare la frequenza, aprire la visione e riconnettersi alla missione d'Anima.",
  },
];

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
        eyebrow="Master Yoga Teacher"
        title="Tina Mastandrea"
        subtitle="Master Yoga Teacher, creatrice del metodo, guida spirituale e formatrice internazionale dedicata al risveglio dell'anima."
        backgroundImage="/images/meditazione-lago-turchese.jpg"
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
          <div className="leading-relaxed text-foreground/80">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">La mia storia</p>
            <div className="mt-4 space-y-4">
              <p>
                Da oltre 25 anni accompagno persone in percorsi di trasformazione attraverso yoga, meditazione e
                pratiche multidimensionali.
              </p>
              <p>
                Fin da bambina sentivo un richiamo naturale al silenzio e alla luce: meditavo senza sapere che quel
                gesto avrebbe tracciato il cammino della mia vita. Quel silenzio è diventato la mia bussola e mi ha
                guidata attraverso anni di ricerca interiore, studio e servizio.
              </p>
              <p>
                Dopo la mia prima certificazione ho iniziato a insegnare in Messico e in California, guidando gruppi
                internazionali in esperienze profonde di risveglio e guarigione. Da allora accompagno anime da tutto
                il mondo in ritiri e percorsi dedicati alla consapevolezza e alla rigenerazione.
              </p>
              <p>
                Il mio cammino integra yoga antico, neuroscienze, pratiche contemplative e discipline energetiche.
                Yoga Stargate è la sintesi di questo viaggio: un metodo che apre portali interiori, risveglia la
                presenza e riconnette alla missione d&apos;Anima.
              </p>
              <p className="font-heading text-lg font-semibold text-foreground">
                Per me non è un lavoro: è una missione.
              </p>
              <p>
                Negli anni ho compreso che la mia guida non si rivolge solo alle persone, ma anche ai gruppi e alle
                realtà olistiche che desiderano integrare una dimensione spirituale autentica e contemporanea. Creo
                percorsi, programmi e spazi dedicati alla consapevolezza, unendo metodo, presenza e una visione
                chiara del potenziale umano.
              </p>
              <p>
                Collaboro con centri, retreat e progetti in evoluzione, portando direzione, profondità e stabilità in
                ogni esperienza, affinché la trasformazione sia reale, radicata e luminosa.
              </p>
            </div>
            <Link
              href="/metodo"
              className="inline-flex cursor-pointer items-center gap-1 pt-4 text-base font-semibold text-primary"
            >
              Scopri il Metodo & Percorso di formazione
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-10">
          <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Come posso accompagnarti
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {offerings.map((o) => (
              <li key={o.title}>
                <p className="font-heading text-base font-semibold text-foreground">{o.title}</p>
                <p className="mt-1.5 text-sm text-foreground/70">{o.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 leading-relaxed text-foreground/80">
            Collaboro anche con centri, retreat e progetti olistici che vogliono integrare una dimensione spirituale
            autentica e contemporanea.
          </p>
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-center shadow-soft-sm sm:p-8">
            <p className="font-heading text-lg font-semibold text-foreground">
              Se senti che questo è il tuo momento — sono qui.
            </p>
            <Link
              href="/contatti"
              className="mt-4 inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft-sm transition-transform hover:-translate-y-0.5"
            >
              Scrivimi
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-3xl border border-border bg-card p-6 text-left shadow-soft-sm">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-20">
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
