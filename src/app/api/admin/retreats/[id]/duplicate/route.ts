import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Crea una copia dell'evento (testi, foto, programma, prezzo...) come BOZZA, pronta da
// modificare: per ripetere un workshop o una masterclass cambiando solo data e orario.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const source = await prisma.retreat.findUnique({ where: { id } });
  if (!source) return NextResponse.json({ error: "Evento non trovato." }, { status: 404 });

  // Indirizzo (slug) libero: "nome-copia", poi "nome-copia-2", "nome-copia-3"...
  const base = `${source.slug}-copia`.slice(0, 190);
  let slug = base;
  for (let n = 2; await prisma.retreat.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${base}-${n}`;
  }

  const copy = await prisma.retreat.create({
    data: {
      slug,
      title: `${source.title} (copia)`.slice(0, 200),
      category: source.category,
      location: source.location,
      excerpt: source.excerpt,
      description: source.description,
      startDate: source.startDate,
      endDate: source.endDate,
      price: source.price,
      images: source.images,
      videoUrl: source.videoUrl,
      itinerary: source.itinerary,
      requiredLevel: source.requiredLevel,
      ctaLabel: source.ctaLabel,
      ctaUrl: source.ctaUrl,
      status: "DRAFT",
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
