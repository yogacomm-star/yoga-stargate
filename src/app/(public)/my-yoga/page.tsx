import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/site/Hero";
import ScrollCarousel from "@/components/site/ScrollCarousel";
import TrialLessonButton from "@/components/site/TrialLessonButton";
import { CheckCircle2, RefreshCcw, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Percorsi Live a Milano",
  description:
    "I Percorsi Live di Yoga Stargate a Milano: cicli di 4 lezioni con un tema specifico, rinnovabili. Prova la prima lezione a 20€.",
  alternates: { canonical: "/my-yoga" },
};

const classes = [
  {
    title: "Lezione del mattino",
    time: "Mercoledì, 9:00 – 10:15",
    description: "Un inizio di giornata dolce e presente, per portare chiarezza e focus nel resto della giornata.",
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
    description: "Il percorso di riferimento del metodo Yoga Stargate: pratica completa, tra corpo, respiro e meditazione.",
    level: "Base / Intermedio",
  },
  {
    title: "Livello avanzato",
    time: "Mercoledì, 19:45 – 21:00",
    description: "Per chi ha già consolidato le basi e vuole approfondire tecniche più avanzate.",
    level: "Avanzato",
  },
];

const steps = [
  {
    icon: Target,
    title: "1. Prova una lezione",
    text: "Scegli l'orario che preferisci e prova una lezione: costa 20€ e ti fa vivere il metodo dal vivo, senza impegno.",
  },
  {
    icon: Users,
    title: "2. Entra nel percorso",
    text: "Se risuona con te, ti iscrivi al percorso di 4 lezioni: un ciclo con un argomento specifico, in un piccolo gruppo seguito da Tina.",
  },
  {
    icon: RefreshCcw,
    title: "3. Rinnova con un nuovo tema",
    text: "Alla fine del ciclo puoi rinnovare: ogni percorso di 4 lezioni approfondisce un tema nuovo, e la pratica cresce con te.",
  },
];

const includes = [
  "Cicli di 4 lezioni con un argomento specifico, non semplici lezioni settimanali",
  "Piccoli gruppi per un'attenzione reale a ogni persona",
  "Materiale e tappetini disponibili in sala",
  "Percorso graduale, pensato anche per chi ha una vita professionale piena",
];

export default async function MyYogaPage({
  searchParams,
}: {
  searchParams: Promise<{ prenotazione?: string }>;
}) {
  const { prenotazione } = await searchParams;

  return (
    <>
      <Hero
        eyebrow="Percorsi Live"
        title="Percorsi Live a Milano"
        subtitle="Cicli di 4 lezioni con un argomento specifico, guidati da Tina Mastandrea. Provi una lezione, poi entri nel percorso — e puoi rinnovarlo con un tema nuovo."
        primaryCta={{ label: "Prova una lezione — 20€", href: "#prenota" }}
        backgroundImage="/images/lezione-parco-milano.jpeg"
      />

      {prenotazione === "riuscita" && (
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <p className="rounded-2xl border border-primary/30 bg-muted px-6 py-4 text-center font-semibold text-primary">
            Prenotazione ricevuta! Ti scriveremo a breve per confermare la data della tua lezione di prova. A presto sul tappetino ✨
          </p>
        </div>
      )}
      {prenotazione === "annullata" && (
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <p className="rounded-2xl border border-border bg-card px-6 py-4 text-center text-foreground/70">
            Il pagamento è stato annullato. Se hai avuto un problema o preferisci accordarti direttamente, scrivici dai contatti.
          </p>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-[0.95rem] text-foreground/70">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
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
        <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Gli orari a Milano</h2>
        <ScrollCarousel className="mt-8" itemClassName="min-w-[80%] sm:min-w-[46%] lg:min-w-[30%]" ariaLabel="Orari dei percorsi live">
          {classes.map((c) => (
            <div key={c.title} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{c.time}</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 flex-1 text-[0.95rem] text-foreground/70">{c.description}</p>
              <span className="badge-level mt-4 self-start">{c.level}</span>
            </div>
          ))}
        </ScrollCarousel>

        <div
          id="prenota"
          className="mt-14 scroll-mt-24 rounded-2xl border border-border bg-card p-8 shadow-soft-sm sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                Prenota la tua lezione di prova
              </h2>
              <p className="mt-3 text-foreground/70">
                La lezione di prova costa <strong>20€</strong>: scegli l&apos;orario in fase di pagamento e ti
                ricontatteremo per confermare la data. Il pagamento è sicuro, con carta o PayPal.
              </p>
              <ul className="mt-5 grid gap-3">
                {includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-[0.95rem] text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-center">
              <TrialLessonButton />
              <p className="text-sm text-foreground/60">
                Preferisci parlarne prima? <a href="/contatti" className="font-semibold text-primary">Scrivici dai contatti</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
