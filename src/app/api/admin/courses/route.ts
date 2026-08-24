import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isAllowedEmbedUrl } from "@/lib/embed";
import { notifyNewContent } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

const lessonItem = z.object({
  title: z.string().min(1),
  videoUrl: z
    .string()
    .default("")
    .refine(isAllowedEmbedUrl, "Il video deve provenire da YouTube o Vimeo."),
  content: z.string().default(""),
  audioUrl: z.string().trim().max(500).optional(),
  audioKey: z.string().trim().max(300).optional(),
});

export const courseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(1).max(80),
  excerpt: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).max(10000),
  lessons: z.array(lessonItem).default([]),
  coverImage: z.string().trim().max(300).nullable().optional(),
  requiredLevel: z.number().int().min(1).max(3).nullable().optional(),
  price: z.number().min(0).max(9999).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug già in uso." }, { status: 409 });

  const d = parsed.data;
  const course = await prisma.course.create({
    data: {
      title: d.title,
      slug: d.slug,
      category: d.category,
      excerpt: d.excerpt,
      description: d.description,
      lessons: JSON.stringify(d.lessons),
      coverImage: d.coverImage || null,
      requiredLevel: d.requiredLevel ?? null,
      price: d.price ?? null,
      status: d.status,
    },
  });

  if (course.status === "PUBLISHED") {
    void notifyNewContent({
      kind: "corso",
      title: course.title,
      excerpt: course.excerpt,
      url: `${SITE_URL}/corsi/${course.slug}`,
    });
  }

  return NextResponse.json({ ok: true, id: course.id });
}
