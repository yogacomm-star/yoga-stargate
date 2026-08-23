import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import MarkdownContent from "@/components/site/MarkdownContent";
import JsonLd from "@/components/site/JsonLd";
import { SITE_URL } from "@/lib/site";

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt ? post.publishedAt.toISOString() : undefined,
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    publisher: { "@type": "Organization", name: "Yoga Stargate", url: SITE_URL },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd data={articleJsonLd} />
      <Link href="/blog" className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Torna al blog
      </Link>

      <p className="mt-6 text-xs font-semibold tracking-wide text-primary uppercase">{post.category}</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{post.title}</h1>
      <div className="mt-4 flex items-center gap-4 text-sm text-foreground/60">
        <span>{post.author}</span>
        {date && <span>· {date}</span>}
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {post.readTimeMinutes} min di lettura
        </span>
      </div>

      <div className="mt-8 h-56 rounded-2xl bg-gradient-to-br from-warm-surface via-secondary/30 to-primary/15" />

      <div className="mt-8">
        <MarkdownContent content={post.content} />
      </div>
    </article>
  );
}
