import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function NuovoArticoloPage() {
  const rows = await prisma.blogPost.findMany({ distinct: ["category"], select: { category: true } });
  const categories = rows.map((r) => r.category).sort();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Nuovo articolo</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <PostForm categories={categories} />
      </div>
    </div>
  );
}
