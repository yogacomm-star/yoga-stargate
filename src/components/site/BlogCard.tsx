"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export type BlogCardData = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  publishedAt: string | null;
  readTimeMinutes: number;
  image?: string | null;
};

export default function BlogCard({ post }: { post: BlogCardData }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-warm-surface via-secondary/30 to-primary/15">
          {post.image && (
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">{post.category}</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-foreground/60">
            <span>
              {post.author}
              {date ? ` · ${date}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readTimeMinutes} min
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
