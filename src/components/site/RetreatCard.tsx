"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, CalendarDays } from "lucide-react";
import { LevelBadge } from "@/components/site/LevelLock";

export type RetreatCardData = {
  slug: string;
  title: string;
  category: string;
  location: string;
  excerpt: string;
  price: number | null;
  requiredLevel: number | null;
  startDate: string | null;
  endDate: string | null;
  image?: string | null;
};

function formatRange(start: string | null, end: string | null) {
  if (!start) return null;
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) => d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  if (e && e.getTime() !== s.getTime()) return `${fmt(s)} – ${fmt(e)}`;
  return fmt(s);
}

export default function RetreatCard({ retreat }: { retreat: RetreatCardData }) {
  const dateLabel = formatRange(retreat.startDate, retreat.endDate);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft-sm"
    >
      <Link href={`/ritiri/${retreat.slug}`} className="block">
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-secondary/50 via-primary/20 to-warm-surface">
          {retreat.image ? (
            <Image
              src={retreat.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-heading text-sm font-semibold uppercase tracking-wide text-primary/70">
              {retreat.category}
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <LevelBadge requiredLevel={retreat.requiredLevel} />
            {retreat.price != null && (
              <span className="text-sm font-semibold text-foreground">da €{retreat.price}</span>
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary">
            {retreat.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{retreat.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {retreat.location}
            </span>
            {dateLabel && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {dateLabel}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
