import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notifyNewContent } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

const itineraryItem = z.object({ day: z.number(), title: z.string(), description: z.string() });

export const retreatSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(1).max(80),
  location: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).max(10000),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  price: z.number().nonnegative().nullable().optional(),
  images: z.array(z.string()).default([]),
  itinerary: z.array(itineraryItem).default([]),
  requiredLevel: z.number().int().min(1).max(3).nullable().optional(),
  ctaLabel: z.string().trim().min(1).max(80).default("Richiedi informazioni"),
  ctaUrl: z.string().trim().max(300).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = retreatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const existing = await prisma.retreat.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug già in uso." }, { status: 409 });

  const d = parsed.data;
  const retreat = await prisma.retreat.create({
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

  if (retreat.status === "PUBLISHED") {
    void notifyNewContent({
      kind: "ritiro",
      title: retreat.title,
      excerpt: retreat.excerpt,
      url: `${SITE_URL}/ritiri/${retreat.slug}`,
    });
  }

  return NextResponse.json({ ok: true, id: retreat.id });
}
