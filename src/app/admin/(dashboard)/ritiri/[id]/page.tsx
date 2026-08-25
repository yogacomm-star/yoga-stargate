import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RetreatForm, { type RetreatFormData } from "@/components/admin/RetreatForm";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditRitiroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const retreat = await prisma.retreat.findUnique({ where: { id } });
  if (!retreat) notFound();

  let images: string[] = [];
  try {
    images = JSON.parse(retreat.images);
  } catch {}
  let itinerary: RetreatFormData["itinerary"] = [];
  try {
    itinerary = JSON.parse(retreat.itinerary);
  } catch {}

  const initial: RetreatFormData = {
    id: retreat.id,
    title: retreat.title,
    slug: retreat.slug,
    category: retreat.category,
    location: retreat.location,
    excerpt: retreat.excerpt,
    description: retreat.description,
    startDate: toDateInput(retreat.startDate),
    endDate: toDateInput(retreat.endDate),
    price: retreat.price != null ? String(retreat.price) : "",
    requiredLevel: retreat.requiredLevel != null ? String(retreat.requiredLevel) : "",
    ctaLabel: retreat.ctaLabel,
    ctaUrl: retreat.ctaUrl ?? "",
    status: retreat.status,
    coverImage: images[0] ?? null,
    itinerary,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Modifica ritiro</h1>
      <div className="mt-6 max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <RetreatForm initial={initial} />
        </div>
      </div>
    </div>
  );
}
