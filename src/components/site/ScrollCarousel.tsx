"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type ScrollCarouselProps = {
  children: ReactNode;
  /** Larghezza delle slide, es. "min-w-[85%] sm:min-w-[48%] lg:min-w-[32%]" */
  itemClassName?: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * Carousel a scorrimento orizzontale con scroll-snap e frecce,
 * usato per i "box scorrevoli" richiesti in tutto il sito.
 */
export default function ScrollCarousel({ children, itemClassName, className = "", ariaLabel }: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        className="no-scrollbar flex snap-x snap-mandatory items-start gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div key={i} className={`snap-start shrink-0 ${itemClassName ?? "min-w-[85%] sm:min-w-[48%] lg:min-w-[32%]"}`}>
                {child}
              </div>
            ))
          : children}
      </div>

      {canPrev && (
        <button
          type="button"
          aria-label="Scorri indietro"
          onClick={() => scrollBy(-1)}
          className="absolute top-1/2 -left-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-primary shadow-soft-md transition-transform hover:scale-105 sm:-left-5"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          aria-label="Scorri avanti"
          onClick={() => scrollBy(1)}
          className="absolute top-1/2 -right-3 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-primary shadow-soft-md transition-transform hover:scale-105 sm:-right-5"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
