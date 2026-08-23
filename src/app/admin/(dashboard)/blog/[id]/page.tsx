import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm, { type PostFormData } from "@/components/admin/PostForm";

export default async function EditArticoloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const initial: PostFormData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    status: post.status,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "",
    featuredImage: post.featuredImage,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Modifica articolo</h1>
      <div className="mt-6 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <PostForm initial={initial} />
      </div>
    </div>
  );
}
