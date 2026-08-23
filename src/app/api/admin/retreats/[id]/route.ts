import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { retreatSchema } from "@/app/api/admin/retreats/route";
import { notifyNewContent } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = retreatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const conflict = await prisma.retreat.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "Slug già in uso." }, { status: 409 });

  const previous = await prisma.retreat.findUnique({ where: { id }, select: { status: true } });

  const d = parsed.data;
  const retreat = await prisma.retreat.update({
    where: { id },
    data: {
      title: d.title,
      slug: d.slug,
      category: d.category,
      location: d.location,
      excerpt: d.excerpt,
      description: d.description,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
      price: d.price ?? null,
      images: JSON.stringify(d.images),
      itinerary: JSON.stringify(d.itinerary),
      requiredLevel: d.requiredLevel ?? null,
      ctaLabel: d.ctaLabel,
      ctaUrl: d.ctaUrl || null,
      status: d.status,
    },
  });

  if (previous?.status === "DRAFT" && retreat.status === "PUBLISHED") {
    void notifyNewContent({
      kind: "ritiro",
      title: retreat.title,
      excerpt: retreat.excerpt,
      url: `${SITE_URL}/ritiri/${retreat.slug}`,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  await prisma.contactLead.updateMany({ where: { retreatId: id }, data: { retreatId: null } });
  await prisma.retreat.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
