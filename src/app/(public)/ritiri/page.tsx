import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import Hero from "@/components/site/Hero";
import RetreatCard, { type RetreatCardData } from "@/components/site/RetreatCard";
import LeadForm from "@/components/site/LeadForm";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/images";

export const metadata: Metadata = {
  title: "Ritiri & Viaggi",
  description: "Ritiri & Viaggi Yoga Stargate: esperienze immersive in Italia e nel mondo con Tina Mastandrea — mental reset, riconnessione al sé e formazione.",
  alternates: { canonical: "/ritiri" },
};

export default async function RitiriPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const retreats = await prisma.retreat.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
  });

  const categories = Array.from(new Set(retreats.map((r) => r.category)));
  const filtered = categoria ? retreats.filter((r) => r.category === categoria) : retreats;

  const cards: RetreatCardData[] = filtered.map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    location: r.location,
    excerpt: r.excerpt,
    price: r.price,
    requiredLevel: r.requiredLevel,
    startDate: r.startDate ? r.startDate.toISOString() : null,
    endDate: r.endDate ? r.endDate.toISOString() : null,
    image: firstImage(r.images),
  }));

  return (
    <>
      <Hero
        eyebrow="Ritiri & Viaggi"
        title="Ritiri & Viaggi Yoga Stargate"
        subtitle="Esperienze immersive per riattivare la tua frequenza: mental reset, riconnessione al sé e formazione, in Italia e nel mondo."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/ritiri"
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !categoria ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
            }`}
          >
            Tutti
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/ritiri?categoria=${encodeURIComponent(c)}`}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                categoria === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {cards.length === 0 ? (
          <p className="text-sm text-foreground/60">Nessun ritiro trovato per questa categoria.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((r) => (
              <RetreatCard key={r.slug} retreat={r} />
            ))}
          </div>
        )}

        <div id="gruppi" className="mt-16 scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-foreground">Hai un gruppo grande?</h2>
            <p className="mt-2 text-sm text-foreground/70">
              Se siete un gruppo numeroso, non serve aspettare una data già in calendario: possiamo organizzare una
              lezione o un ritiro privato pensato solo per voi, nel luogo e nel periodo che preferite. Raccontaci
              qualcosa in più e ti risponderemo per definire i dettagli.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-xl">
            <LeadForm
              showGroupSize
              defaultMessage="Vorremmo organizzare una lezione/ritiro privato per il nostro gruppo. Ecco qualche dettaglio: luogo o zona preferita, periodo indicativo, tipo di esperienza che cerchiamo..."
              submitLabel="Richiedi un'esperienza privata"
              source="Richiesta gruppo"
            />
          </div>
        </div>
      </section>
    </>
  );
}
