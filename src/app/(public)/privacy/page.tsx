import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Informativa sulla privacy di Yoga Stargate: quali dati raccogliamo e come li trattiamo.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">Informativa</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-foreground/60">Ultimo aggiornamento: agosto 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Titolare del trattamento</h2>
          <p className="mt-2">
            Il titolare del trattamento dei dati è Tina Mastandrea, con sede in Via Zanella 56, Milano. Per
            qualsiasi richiesta relativa ai tuoi dati personali puoi scrivere a{" "}
            <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline underline-offset-2">
              info@yogastargate.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Quali dati raccogliamo</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account:</strong> nome, email e password (memorizzata in forma crittografata) quando ti
              registri per accedere a corsi e ritiri riservati.
            </li>
            <li>
              <strong>Newsletter:</strong> l&apos;indirizzo email che ci lasci per ricevere aggiornamenti e il dono
              gratuito &ldquo;7 Giorni per Meditare Bene&rdquo;.
            </li>
            <li>
              <strong>Richieste di contatto:</strong> nome, email, telefono (facoltativo) e messaggio quando compili
              un modulo di richiesta informazioni su un ritiro o attraverso la pagina Contatti.
            </li>
            <li>
              <strong>Recensioni:</strong> il testo e la valutazione che scegli di pubblicare su corsi e ritiri.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Come usiamo i tuoi dati</h2>
          <p className="mt-2">
            Utilizziamo i tuoi dati esclusivamente per gestire il tuo account, fornirti accesso ai contenuti in base
            al tuo livello, rispondere alle tue richieste, inviarti la newsletter (solo se ti sei iscritto) e
            moderare le recensioni prima della pubblicazione. Non vendiamo né condividiamo i tuoi dati con terze
            parti per finalità di marketing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Cookie</h2>
          <p className="mt-2">
            Il sito utilizza solo cookie tecnici necessari al funzionamento (es. mantenere la sessione di accesso).
            Per maggiori dettagli consulta la nostra{" "}
            <a href="/cookie" className="font-medium text-primary underline underline-offset-2">
              Cookie Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">I tuoi diritti</h2>
          <p className="mt-2">
            In qualsiasi momento puoi richiedere l&apos;accesso, la rettifica o la cancellazione dei tuoi dati
            personali, oppure revocare il consenso alla newsletter (tramite il link presente in ogni email o
            scrivendoci direttamente). Puoi esercitare questi diritti scrivendo a{" "}
            <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline underline-offset-2">
              info@yogastargate.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Conservazione dei dati</h2>
          <p className="mt-2">
            Conserviamo i tuoi dati per il tempo necessario a fornirti il servizio richiesto (es. finché il tuo
            account resta attivo) o comunque nei limiti previsti dalla legge applicabile.
          </p>
        </section>
      </div>
    </article>
  );
}
