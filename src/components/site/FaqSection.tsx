import { HelpCircle } from "lucide-react";
import JsonLd from "@/components/site/JsonLd";

export type FaqItem = { question: string; answer: string };

const defaultFaqs: FaqItem[] = [
  {
    question: "Non ho mai praticato con Tina: da dove inizio?",
    answer:
      "Il modo più semplice è prenotare una lezione di prova dei Percorsi Live a Milano (20€) oppure scaricare il dono gratuito \"7 Giorni per Meditare Bene\" e iniziare dalla pratica quotidiana guidata.",
  },
  {
    question: "Come funzionano i Percorsi Live?",
    answer:
      "Non sono semplici lezioni settimanali: sono percorsi di 4 lezioni alla volta, ciascuno con un argomento specifico. Provi una lezione, e se risuona con te ti iscrivi al percorso di 4 incontri, rinnovabile con un nuovo tema.",
  },
  {
    question: "Cos'è il Metodo Yoga Stargate?",
    answer:
      "È il percorso di formazione in 4 stadi — Kriya, Antar Suddhi, Shakty Radiance e Param Dhyana — pensato per insegnanti di yoga, coach e ricercatori spirituali che vogliono approfondire la pratica fino a diventare guide certificate del metodo. Lo trovi nella pagina Metodo.",
  },
  {
    question: "A chi si rivolge Yoga Stargate?",
    answer:
      "A chi cerca una pratica profonda e contemporanea: manager, professionisti, coach, ricercatori spirituali, insegnanti olistici e di yoga. Il metodo unisce tradizione yogica e neuroscienze, con strumenti concreti e trasformativi.",
  },
  {
    question: "Cosa sono i Percorsi Online?",
    answer:
      "Percorsi in video e audio da seguire dove e quando vuoi: pratiche, rituali di trasformazione ed ebook. Alcuni sono aperti a tutti, altri si sbloccano proseguendo nel percorso.",
  },
  {
    question: "Come funzionano i Ritiri & Viaggi?",
    answer:
      "Sono esperienze immersive in Italia e nel mondo, con temi come mental reset, riconnessione al sé e formazione. Trovi date e destinazioni nella pagina Ritiri & Viaggi; i posti sono limitati per mantenere gruppi raccolti.",
  },
  {
    question: "Ho un gruppo: possiamo organizzare un ritiro dedicato?",
    answer:
      "Sì. Se hai un gruppo o un'azienda, Tina — Master Yoga Teacher International — organizza lezioni e ritiri privati su misura, nel luogo e nel periodo che preferite. Scrivici dal modulo contatti o dalla sezione gruppi.",
  },
  {
    question: "Come posso pagare?",
    answer:
      "Percorsi online e prenotazioni si pagano in modo sicuro direttamente dal sito, con carta o PayPal. Per ritiri ed esperienze private ti inviamo tutte le indicazioni al momento della conferma.",
  },
];

export default function FaqSection({ faqs = defaultFaqs, title = "Domande frequenti" }: { faqs?: FaqItem[]; title?: string }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd data={faqJsonLd} />
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
          <HelpCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">{title}</h2>
      </div>
      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
          <details
            key={f.question}
            className="group rounded-2xl border border-border bg-card px-6 py-4 shadow-soft-sm open:shadow-soft-md"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {f.question}
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/75">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
