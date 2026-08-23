import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseForm, { type CourseFormData } from "@/components/admin/CourseForm";

export default async function EditCorsoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

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
    status: course.status,
    coverImage: course.coverImage,
    lessons,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Modifica corso</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <CourseForm initial={initial} />
      </div>
    </div>
  );
}
