import type { Metadata } from "next";
import Image from "next/image";
import { Award, CheckCircle2, Compass, Flame, HeartPulse, Sun } from "lucide-react";
import Hero from "@/components/site/Hero";
import LeadForm from "@/components/site/LeadForm";
import JsonLd from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Il Metodo",
  description:
    "Il Metodo Yoga Stargate: un percorso di formazione in 4 stadi — Kriya, Antar Suddhi, Shakty Radiance, Param Dhyana — per purificare corpo e mente e diventare guida della nuova frequenza, con Tina Mastandrea.",
  keywords: [
    "metodo yoga stargate",
    "formazione insegnanti yoga",
    "diventa insegnante yoga",
    "yoga multidimensionale",
    "Tina Mastandrea",
    "kriya yoga",
    "certificazione yoga",
  ],
  alternates: { canonical: "/metodo" },
};

const processes = [
  {
    number: "01",
    icon: Flame,
    title: "Processo Kriya",
    subtitle: "Il reboot del tuo sistema energetico",
    focus: "Purificazione, detox e risveglio del corpo-tempio",
    text: "Attraverso kriya fluidi, neuroscienze e mantra cosmici, sciogli i blocchi che limitano il tuo potenziale: corpo vibrante, mente chiara, sistema resettato.",
  },
  {
    number: "02",
    icon: HeartPulse,
    title: "Processo Antar Suddhi",
    subtitle: "Guarigione del cuore e del pensiero",
    focus: "Trasformazione quantistica e geometria sacra",
    text: "Lavoriamo sulle frequenze invisibili per armonizzare le emozioni e sciogliere le memorie limitanti: pace interiore stabile e percezione più ampia.",
  },
  {
    number: "03",
    icon: Sun,
    title: "Processo Shakty Radiance",
    subtitle: "Incarna la tua luce divina superiore",
    focus: "Attivazione Divya Jyoti e risveglio del cuore spirituale",
    text: "Riconnetti la tua scintilla originaria e trovi la forza per guidare te stesso e gli altri con stabilità: carisma naturale, chiarezza di vita, cuore spirituale aperto.",
  },
  {
    number: "04",
    icon: Compass,
    title: "Processo Param Dhyana",
    subtitle: "Vivi la tua missione multidimensionale",
    focus: "Merkabha, espansione e co-creazione consapevole",
    text: "Diventa co-creatrice della realtà: la meditazione si trasforma in visione e azione. Attivi la tua Merkabha e ti connetti alla tua missione multidimensionale.",
  },
];

const audience = [
  "Insegnanti di yoga che cercano un'evoluzione del proprio insegnamento",
  "Light worker, coach, terapeuti e facilitatori",
  "Chi è già in un percorso di trasformazione personale",
  "Professionisti che stanno cambiando identità o direzione di vita",
  "Chi vuole sviluppare sensibilità energetica e intuizione",
  "Chi cerca strumenti concreti per co-creare consapevolmente la propria realtà",
];

const includes = [
  "I 4 processi del metodo, ciascuno in un ritiro residenziale di 6 giorni",
  "Trasmissioni di nuova coscienza cosmica",
  "Pratiche di embodiment e integrazione",
  "Materiale didattico e pratiche audio da continuare a casa",
  "Una consulenza personalizzata dopo ogni ritiro",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  name: "Metodo & Percorso di Formazione Yoga Stargate",
  description:
    "Percorso di formazione in 4 stadi (Kriya, Antar Suddhi, Shakty Radiance, Param Dhyana) per insegnanti di yoga e ricercatori spirituali, con certificazione Yoga Stargate.",
  provider: {
    "@type": "Organization",
    name: "Yoga Stargate",
    sameAs: SITE_URL,
  },
  occupationalCredentialAwarded: "Certificazione Yoga Stargate",
  url: `${SITE_URL}/metodo`,
};

export default function MetodoPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero
        eyebrow="Metodo & Formazione"
        title="Il Metodo Yoga Stargate"
        subtitle="Dalla purificazione alla maestria: risveglia la tua luce interiore e diventa guida della nuova frequenza. Non un semplice corso di yoga, ma un'attivazione in 4 stadi."
        primaryCta={{ label: "Scrivimi per date e info", href: "#richiedi" }}
        backgroundImage="/images/hero-luce-nuvole.jpeg"
      />

      <section className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="text-lg leading-relaxed text-foreground/80">
          Il Metodo Yoga Stargate è un percorso di formazione in <strong>4 stadi</strong>, pensato per{" "}
          <strong>purificare il corpo-tempio</strong>, <strong>guarire le memorie profonde</strong> e{" "}
          <strong>incarnare la propria missione d&apos;anima</strong>. Ogni stadio è un ritiro residenziale
          guidato da Tina Mastandrea, e rilascia una certificazione specifica: completando l&apos;intero ciclo si
          diventa maestro del metodo.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {processes.map((p) => (
            <div key={p.number} className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-soft-sm">
              <span className="font-heading text-5xl font-semibold text-primary/10">{p.number}</span>
              <span className="absolute top-7 right-7 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">{p.title}</h2>
              <p className="mt-1 font-heading text-base font-medium text-primary">{p.subtitle}</p>
              <p className="mt-3 text-sm font-semibold tracking-wide text-foreground/60 uppercase">{p.focus}</p>
              <p className="mt-2 text-[0.95rem] text-foreground/70">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative h-64 overflow-hidden rounded-2xl shadow-soft-md sm:h-96">
            <Image
              src="/images/tina-posa-galavasana-mare.jpg"
              alt="Tina Mastandrea in una posizione yoga avanzata sul mare"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl shadow-soft-md sm:h-96">
            <Image
              src="/images/meditazione-neuroscienza.jpg"
              alt="Meditazione e neuroscienze nel Metodo Yoga Stargate"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">A chi è rivolto</h2>
            <ul className="mt-5 grid gap-3">
              {audience.map((a) => (
                <li key={a} className="flex items-start gap-2 text-[0.95rem] text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Cosa include</h2>
            <ul className="mt-5 grid gap-3">
              {includes.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[0.95rem] text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {i}
                </li>
              ))}
            </ul>
            <div className="mt-6 inline-flex items-start gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-xs text-foreground/60">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Ogni modulo rilascia una Certificazione Specifica Yoga Stargate. Il percorso richiede un impegno
              sincero ed è controindicato in presenza di condizioni psicofisiche importanti, epilessia o
              trattamenti psichiatrici in corso.
            </div>
          </div>
        </div>

        <div
          id="richiedi"
          className="mt-14 scroll-mt-24 rounded-2xl border border-border bg-card p-8 shadow-soft-sm sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                Ti racconto date, luoghi e come partecipare
              </h2>
              <p className="mt-3 text-foreground/70">
                Scrivimi qualche riga su di te e sul motivo per cui ti attrae il Metodo Yoga Stargate: ti risponderò
                personalmente con le prossime date disponibili.
              </p>
            </div>
            <LeadForm
              defaultMessage="Vorrei ricevere informazioni sul Metodo & Percorso di Formazione Yoga Stargate: date, luoghi e come partecipare."
              submitLabel="Richiedi informazioni sul metodo"
              source="Richiesta Metodo"
            />
          </div>
        </div>
      </section>
    </>
  );
}
