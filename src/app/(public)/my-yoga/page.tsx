import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/site/Hero";
import LeadForm from "@/components/site/LeadForm";
import JsonLd from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";
import { Flame, Sparkles, UserRound, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Percorsi Live a Milano — Masterclass, Workshop e Percorso Individuale",
  description:
    "I Percorsi Live di Yoga Stargate allo Spazio Yoga Lambrate a Milano: masterclass (49€), workshop (70€) e percorso individuale (90€) con Tina Mastandrea. Posti limitati.",
  alternates: { canonical: "/my-yoga" },
};

const offerings = [
  {
    icon: Sparkles,
    title: "Masterclass",
    cadence: "2 ore di pratica intensiva",
    price: "49€",
    description:
      "Incontri tematici che integrano pratiche energetiche, elementi di neuroscienze, respirazione consapevole, meditazione guidata e i processi del metodo Yoga Stargate. Esperienze profonde ma accessibili, pensate per chi desidera un lavoro mirato, efficace e trasformativo.",
    next: "Prossima Masterclass: “Pratiche di Risveglio” — 21 ottobre, 17:00–19:00",
    audience: "Ideale per: professionisti, manager, persone in trasformazione, praticanti che desiderano un lavoro mirato.",
  },
  {
    icon: Flame,
    title: "Workshop",
    cadence: "3 ore di pratica intensiva",
    price: "70€",
    description:
      "Un percorso più ampio, dedicato a chi desidera entrare nel cuore del metodo Yoga Stargate Multidimensionale: un'esperienza che integra corpo, energia e visione, ideale per chi vuole fare un passo significativo nel proprio cammino. Si conclude con una presentazione dei ritiri e dei viaggi spirituali, per chi desidera proseguire nel percorso trasformativo.",
    next: "Prossimo workshop: 4 novembre, 17:00–20:00",
    audience: "Perfetto per: operatori olistici, terapeuti, insegnanti yoga, professionisti in ricerca di strumenti avanzati.",
    program: [
      "Kriyā Detox — Rilascio e Purificazione",
      "Pratiche Quantistiche di Guarigione Interiore",
      "Meditazioni Luminose — Attivazione della Presenza",
      "Meditazioni Multidimensionali — Espansione e Visione",
    ],
  },
  {
    icon: UserRound,
    title: "Percorso Individuale",
    cadence: "Accompagnamento personale — su appuntamento",
    price: "90€ a incontro",
    description:
      "Un cammino dedicato a chi desidera un lavoro mirato, profondo e su misura. Integra pratiche energetiche, meditazione, respirazione e i processi del metodo Yoga Stargate, adattati alle esigenze specifiche della persona. Durata: 4 o 8 incontri, oppure percorso continuativo.",
    audience: "Ideale per: professionisti e manager, persone in trasformazione, operatori olistici e terapeuti, insegnanti yoga che desiderano approfondire.",
  },
];

const eventJsonLd = offerings
  .filter((o) => "next" in o)
  .map((o) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${o.title} — Yoga Stargate`,
    description: o.description,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Spazio Yoga Lambrate",
      address: { "@type": "PostalAddress", streetAddress: "Rimembranze di Lambrate 16", addressLocality: "Milano", addressCountry: "IT" },
    },
    organizer: { "@type": "Organization", name: "Yoga Stargate", url: SITE_URL },
    offers: { "@type": "Offer", price: o.price.replace(/[^\d]/g, ""), priceCurrency: "EUR", availability: "https://schema.org/LimitedAvailability" },
  }));

export default function MyYogaPage() {
  return (
    <>
      {eventJsonLd.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <Hero
        eyebrow="Percorsi Live"
        title="Percorsi Live a Milano"
        subtitle="Allo Spazio Yoga Lambrate: un luogo dedicato alla pratica, alla presenza e alla trasformazione. Esperienze che aprono, percorsi che guidano, incontri che trasformano."
        backgroundImage="/images/lezione-parco-milano.jpeg"
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {offerings.map((o) => (
            <div key={o.title} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft-sm sm:p-7">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <o.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-semibold text-foreground">{o.title}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary/70">{o.cadence}</p>
              <p className="mt-3 flex-1 text-[0.95rem] text-foreground/70">{o.description}</p>

              {"program" in o && o.program && (
                <ol className="mt-4 space-y-1.5 text-sm text-foreground/80">
                  {o.program.map((step, i) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-semibold text-primary">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ol>
              )}

              <p className="mt-4 text-sm font-medium text-foreground/80">{o.audience}</p>
              {"next" in o && o.next && (
                <p className="mt-3 rounded-xl bg-muted px-3.5 py-2.5 text-sm font-semibold text-foreground">{o.next}</p>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="font-heading text-2xl font-semibold text-foreground">{o.price}</span>
                <span className="text-xs font-medium text-foreground/50">Posti limitati</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative h-64 overflow-hidden rounded-3xl shadow-soft-md sm:h-80">
            <Image
              src="/images/cerchio-meditazione-parco.png"
              alt="Cerchio di meditazione a Milano"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative h-64 overflow-hidden rounded-3xl shadow-soft-md sm:h-80">
            <Image
              src="/images/lezione-parco-milano.jpeg"
              alt="Pratica yoga dal vivo a Milano"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="prenota" className="mx-auto max-w-4xl scroll-mt-24 px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft-sm sm:p-10">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Come iniziare</h2>
            <p className="mx-auto mt-3 max-w-xl text-foreground/70">
              Scegli la modalità che risuona con te: una masterclass per aprire, un workshop per approfondire, un
              percorso individuale per trasformare. Scrivici per prenotare il tuo posto — sono sempre limitati.
            </p>
          </div>
          <ul className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row sm:justify-center sm:gap-6">
            {["Spazio Yoga Lambrate, Rimembranze di Lambrate 16, Milano", "Posti limitati"].map((i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {i}
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-8 max-w-xl">
            <LeadForm
              defaultMessage="Vorrei prenotare il mio posto ai Percorsi Live di Yoga Stargate: fatemi sapere le prossime disponibilità per masterclass, workshop o percorso individuale."
              submitLabel="Prenota il tuo posto"
              source="Richiesta Percorsi Live"
            />
          </div>
        </div>
      </section>
    </>
  );
}
