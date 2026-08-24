import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "@/components/site/Logo";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M14 8.5h2.5V5H14c-2.2 0-4 1.8-4 4v2H8v3.5h2V21h3.5v-6.5H16l.5-3.5h-3V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Esplora",
    links: [
      { href: "/chi-sono", label: "Chi Sono" },
      { href: "/my-yoga", label: "Metodo" },
      { href: "/ritiri", label: "Ritiri" },
      { href: "/corsi", label: "Corsi" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Informazioni",
    links: [
      { href: "/contatti", label: "Contatti" },
      { href: "/login", label: "Accedi" },
      { href: "/registrati", label: "Registrati" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="flex items-center">
              <Logo iconSize={52} textClassName="text-xl" />
            </Link>
            <p className="mt-3 max-w-sm text-sm text-foreground/70">
              Yoga multidimensionale per il risveglio interiore, con Tina Mastandrea. Milano e non solo.
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-foreground/70">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              Via Zanella 56, Milano
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-foreground/70">
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
              <a href="https://wa.me/393336980044" className="hover:text-primary">
                +39 333 698 0044
              </a>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-foreground/70">
              <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
              <a href="mailto:info@yogastargate.com" className="hover:text-primary">
                info@yogastargate.com
              </a>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="cursor-pointer rounded-full border border-border p-2 text-foreground/70 hover:border-primary hover:text-primary"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="cursor-pointer rounded-full border border-border p-2 text-foreground/70 hover:border-primary hover:text-primary"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-foreground/70 hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">Resta aggiornata/o</h3>
            <p className="mt-3 text-sm text-foreground/70">
              Registrati per ricevere pratiche, riflessioni e novità sui prossimi ritiri direttamente via email.
            </p>
            <div className="mt-4">
              <Link
                href="/registrati"
                className="inline-flex cursor-pointer items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Crea un account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Yoga Stargate — Tina Mastandrea. Tutti i diritti riservati.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/cookie" className="hover:text-primary">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
