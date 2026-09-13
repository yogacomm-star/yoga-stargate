"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { LevelBadge } from "@/components/site/LevelLock";

export type CourseCardData = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  requiredLevel: number | null;
  price?: number | null;
  lessonCount: number;
  image?: string | null;
};

export default function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft-sm"
    >
      <Link href={`/corsi/${course.slug}`} className="flex h-full flex-col">
        <div className="relative h-52 shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/40 to-warm-surface">
          {course.image ? (
            <Image
              src={course.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <PlayCircle className="absolute inset-0 m-auto h-10 w-10 text-primary/70" aria-hidden="true" />
          )}
        </div>
        {/* flex-col + line-clamp: qualunque lunghezza scrivano titolo ed estratto nel pannello
            admin, la scheda resta della stessa altezza delle vicine nella griglia — il testo
            in eccesso si tronca con "…" invece di allungare la scheda o spingere via il resto. */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <LevelBadge requiredLevel={course.requiredLevel} price={course.price} />
            <span className="text-xs font-medium text-foreground/60">
              {course.lessonCount} {course.lessonCount === 1 ? "lezione" : "lezioni"}
            </span>
          </div>
          <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wide text-primary/70">
            {course.category}
          </p>
          <h3 className="mt-1 line-clamp-2 font-heading text-lg font-semibold text-foreground group-hover:text-primary">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-foreground/70">{course.excerpt}</p>
        </div>
      </Link>
    </motion.article>
  );
}
