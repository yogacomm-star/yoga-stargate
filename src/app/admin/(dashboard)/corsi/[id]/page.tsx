import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseForm, { type CourseFormData } from "@/components/admin/CourseForm";

export default async function EditCorsoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, categoryRows] = await Promise.all([
    prisma.course.findUnique({ where: { id } }),
    prisma.course.findMany({ distinct: ["category"], select: { category: true } }),
  ]);
  if (!course) notFound();
  const categories = categoryRows.map((r) => r.category).sort();

  let lessons: CourseFormData["lessons"] = [];
  try {
    lessons = JSON.parse(course.lessons);
  } catch {}

  const initial: CourseFormData = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    category: course.category,
    excerpt: course.excerpt,
    description: course.description,
    requiredLevel: course.requiredLevel != null ? String(course.requiredLevel) : "",
    price: course.price != null ? String(course.price) : "",
    status: course.status,
    coverImage: course.coverImage,
    lessons,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Modifica corso</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <CourseForm initial={initial} categories={categories} />
      </div>
    </div>
  );
}
