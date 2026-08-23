import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Quali cookie usa Yoga Stargate e perché.",
  alternates: { canonical: "/cookie" },
  robots: { index: false, follow: true },
};

const cookies = [
  {
    name: "ys_session",
    purpose: "Mantiene attiva la tua sessione dopo l'accesso, così non devi effettuare il login a ogni pagina.",
    duration: "30 giorni",
    type: "Tecnico (necessario)",
  },
  {
    name: "ys_cookie_consent",
    purpose: "Ricorda la tua scelta sul banner cookie, per non mostrartelo di nuovo a ogni visita.",
    duration: "Permanente (fino a cancellazione manuale)",
    type: "Tecnico (necessario)",
  },
];

export default function CookiePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-primary uppercase">Informativa</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">Cookie Policy</h1>
      <p className="mt-2 text-sm text-foreground/60">Ultimo aggiornamento: agosto 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
        <p>
          Il sito Yoga Stargate utilizza esclusivamente cookie tecnici, necessari al funzionamento base del sito
          (come mantenere l&apos;accesso al tuo account). Non utilizziamo cookie di profilazione, pubblicitari o di
          tracciamento di terze parti.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
              <tr>
                <th className="px-4 py-3">Cookie</th>
                <th className="px-4 py-3">Finalità</th>
                <th className="px-4 py-3">Durata</th>
                <th className="px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {cookies.map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3">{c.purpose}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.duration}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground">Come gestire i cookie</h2>
          <p className="mt-2">
            Puoi rifiutare i cookie non essenziali dal banner mostrato alla tua prima visita, oppure cancellare i
            cookie già salvati in qualsiasi momento dalle impostazioni del tuo browser. Disattivare il cookie{" "}
            <span className="font-mono text-xs">ys_session</span> impedirà di restare collegato al tuo account tra
            una pagina e l&apos;altra.
          </p>
        </section>

        <p>
          Per qualsiasi domanda su questa informativa puoi scriverci a{" "}
          <a href="mailto:info@yogastargate.com" className="font-medium text-primary underline underline-offset-2">
            info@yogastargate.com
          </a>
          .
        </p>
      </div>
    </article>
  );
}
