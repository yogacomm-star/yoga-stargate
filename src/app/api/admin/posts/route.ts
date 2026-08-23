import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notifyNewContent } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

function readTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const postSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(1).max(80),
  excerpt: z.string().trim().min(1).max(500),
  content: z.string().trim().min(1).max(20000),
  featuredImage: z.string().trim().max(300).nullable().optional(),
  author: z.string().trim().min(1).max(120).default("Tina Mastandrea"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug già in uso." }, { status: 409 });

  const d = parsed.data;
  const post = await prisma.blogPost.create({
    data: {
      title: d.title,
      slug: d.slug,
      category: d.category,
      excerpt: d.excerpt,
      content: d.content,
      featuredImage: d.featuredImage || null,
      author: d.author,
      status: d.status,
      publishedAt: d.status === "PUBLISHED" ? new Date(d.publishedAt || Date.now()) : d.publishedAt ? new Date(d.publishedAt) : null,
      readTimeMinutes: readTime(d.content),
    },
  });

  if (post.status === "PUBLISHED") {
    void notifyNewContent({
      kind: "articolo",
      title: post.title,
      excerpt: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
    });
  }

  return NextResponse.json({ ok: true, id: post.id });
}
