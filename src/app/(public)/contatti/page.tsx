import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Hero from "@/components/site/Hero";
import LeadForm from "@/components/site/LeadForm";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Scrivici per informazioni su lezioni, corsi e ritiri di Yoga Stargate a Milano.",
  alternates: { canonical: "/contatti" },
};

export default function ContattiPage() {
  return (
    <>
      <Hero eyebrow="Contatti" title="Parliamone" subtitle="Scrivici per qualsiasi informazione su lezioni, corsi o ritiri: ti risponderemo il prima possibile." />

      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Dove siamo</p>
                  <p className="text-sm text-foreground/70">Via Zanella 56, Milano</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">WhatsApp</p>
                  <a href="https://wa.me/393336980044" className="text-sm text-foreground/70 hover:text-primary">
                    +39 333 698 0044
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href="mailto:info@yogastargate.com" className="text-sm text-foreground/70 hover:text-primary">
                    info@yogastargate.com
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Lezioni in sede</p>
                  <p className="text-sm text-foreground/70">Ogni mercoledì, dalle 9:00 alle 21:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-foreground">Inviaci un messaggio</h2>
            <div className="mt-5">
              <LeadForm submitLabel="Invia messaggio" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
