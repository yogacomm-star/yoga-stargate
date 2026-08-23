import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { postSchema } from "@/app/api/admin/posts/route";
import { notifyNewContent } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

function readTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const conflict = await prisma.blogPost.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "Slug già in uso." }, { status: 409 });

  const previous = await prisma.blogPost.findUnique({ where: { id }, select: { status: true } });

  const d = parsed.data;
  const post = await prisma.blogPost.update({
    where: { id },
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

  if (previous?.status === "DRAFT" && post.status === "PUBLISHED") {
    void notifyNewContent({
      kind: "articolo",
      title: post.title,
      excerpt: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
