import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/site/Hero";
import RetreatCard, { type RetreatCardData } from "@/components/site/RetreatCard";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/images";

export const metadata: Metadata = {
  title: "Ritiri Yoga in Italia e nel Mondo",
  description: "I ritiri di Yoga Stargate: esperienze immersive in Italia e nel mondo con Tina Mastandrea.",
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
        eyebrow="Ritiri"
        title="Ritiri e viaggi Yoga Stargate"
        subtitle="Esperienze immersive per riattivare la tua frequenza: dalla via micaelica di Assisi ai luoghi sacri del mondo."
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
      </section>
    </>
  );
}
