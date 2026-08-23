"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

type Testimonial = { name: string; role: string; quote: string };

const testimonials: Testimonial[] = [
  {
    name: "Giulia F.",
    role: "Allieva da 2 anni",
    quote:
      "Con Tina ho scoperto un modo completamente nuovo di vivere la pratica: non solo corpo, ma vera consapevolezza. I ritiri sono un punto di svolta ogni volta.",
  },
  {
    name: "Marco T.",
    role: "Livello Intermedio",
    quote:
      "Lo Yoga Stargate mi ha aiutato a riprogrammare abitudini che portavo da anni. Le lezioni online sono chiare e la community è accogliente.",
  },
  {
    name: "Elena R.",
    role: "Livello Avanzato",
    quote:
      "Il ritiro ad Assisi è stato uno dei momenti più intensi della mia vita. Un percorso serio, guidato con grande delicatezza e competenza.",
  },
  {
    name: "Davide P.",
    role: "Allievo da 6 mesi",
    quote:
      "Ho iniziato senza alcuna esperienza di yoga. Il percorso base mi ha messo a mio agio fin da subito, con pratiche accessibili ma mai banali.",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % testimonials.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length), []);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [paused, next]);

  const current = testimonials[index];

  return (
    <div
      className="relative mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-soft-md sm:p-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carosello"
      aria-label="Testimonianze delle allieve e degli allievi"
    >
      <Quote className="mx-auto h-8 w-8 text-primary/50" aria-hidden="true" />

      <div className="mt-4 min-h-[7rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-base text-foreground/80 sm:text-lg">&ldquo;{current.quote}&rdquo;</p>
            <p className="mt-4 font-heading text-sm font-semibold text-foreground">{current.name}</p>
            <p className="text-xs text-foreground/60">{current.role}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Testimonianza precedente"
          className="cursor-pointer rounded-full border border-border p-2 text-foreground/60 hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Vai alla testimonianza ${i + 1} di ${testimonials.length}`}
              aria-current={i === index}
              className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          aria-label="Testimonianza successiva"
          className="cursor-pointer rounded-full border border-border p-2 text-foreground/60 hover:border-primary hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
