import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { courseSchema } from "@/app/api/admin/courses/route";
import { notifyNewContent } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const conflict = await prisma.course.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "Slug già in uso." }, { status: 409 });

  const previous = await prisma.course.findUnique({ where: { id }, select: { status: true } });

  const d = parsed.data;
  const course = await prisma.course.update({
    where: { id },
    data: {
      title: d.title,
      slug: d.slug,
      category: d.category,
      excerpt: d.excerpt,
      description: d.description,
      lessons: JSON.stringify(d.lessons),
      coverImage: d.coverImage || null,
      requiredLevel: d.requiredLevel ?? null,
      status: d.status,
    },
  });

  if (previous?.status === "DRAFT" && course.status === "PUBLISHED") {
    void notifyNewContent({
      kind: "corso",
      title: course.title,
      excerpt: course.excerpt,
      url: `${SITE_URL}/corsi/${course.slug}`,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  await prisma.courseProgress.deleteMany({ where: { courseId: id } });
  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
