import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isAllowedEmbedUrl } from "@/lib/embed";

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("IMAGE"),
    imageUrl: z.string().trim().min(1).max(500),
    imageKey: z.string().trim().min(1).max(300),
    caption: z.string().trim().max(200).optional(),
  }),
  z.object({
    type: z.literal("VIDEO"),
    videoUrl: z.string().trim().min(1).max(500).refine(isAllowedEmbedUrl, "Il video deve provenire da YouTube o Vimeo."),
    caption: z.string().trim().max(200).optional(),
  }),
]);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  // I nuovi elementi vanno sempre in fondo: l'ordine di partenza è tutto quello che serve,
  // poi si sistema dalla griglia con le frecce su/giù.
  const last = await prisma.galleryItem.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  const order = (last?.order ?? -1) + 1;

  const d = parsed.data;
  const item = await prisma.galleryItem.create({
    data:
      d.type === "IMAGE"
        ? { type: "IMAGE", imageUrl: d.imageUrl, imageKey: d.imageKey, caption: d.caption || null, order }
        : { type: "VIDEO", videoUrl: d.videoUrl, caption: d.caption || null, order },
  });

  return NextResponse.json({ ok: true, id: item.id });
}
