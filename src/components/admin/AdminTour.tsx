"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ArrowLeft, ArrowRight, X } from "lucide-react";
import { adminTourSteps } from "@/lib/adminTourSteps";

const STORAGE_KEY = "ys_admin_tour_seen";

type Rect = { top: number; left: number; width: number; height: number };

export default function AdminTour() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = adminTourSteps[stepIndex];
  const isLast = stepIndex === adminTourSteps.length - 1;

  const startTour = useCallback(() => {
    setStepIndex(0);
    setRect(null);
    setOpen(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }, []);

  useEffect(() => {
    // Il tour si avvia da solo solo alla primissima visita e solo se l'admin
    // si trova già sulla dashboard, per non interromperlo mentre lavora altrove.
    if (pathname !== "/admin") return;
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(startTour, 700);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [startTour, pathname]);

  useEffect(() => {
    if (!open) return;
    if (pathname !== step.href) {
      router.push(step.href);
      return;
    }

    if (pollRef.current) clearInterval(pollRef.current);
    const clearTimer = setTimeout(() => setRect(null), 0);

    if (!step.target) return () => clearTimeout(clearTimer);

    let attempts = 0;
    pollRef.current = setInterval(() => {
      attempts += 1;
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 280);
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (attempts > 20) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 60);

    return () => {
      clearTimeout(clearTimer);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex, pathname]);

  useEffect(() => {
    if (!open || !step.target) return;
    function onResize() {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, step.target]);

  function next() {
    if (isLast) {
      setOpen(false);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, adminTourSteps.length - 1));
  }

  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const tooltipStyle: CSSProperties = rect
    ? {
        position: "fixed",
        top: Math.min(rect.top + rect.height + 16, window.innerHeight - 220),
        left: Math.min(Math.max(rect.left, 16), window.innerWidth - 360),
      }
    : {};

  return (
    <>
      <button
        type="button"
        onClick={startTour}
        data-tour="admin-guida-button"
        className="fixed right-6 bottom-6 z-[90] flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft-lg transition-transform hover:-translate-y-0.5"
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
        Guida
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-[95] bg-transparent"
            />

            {rect && (
              <motion.div
                animate={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                style={{ position: "fixed", boxShadow: "0 0 0 9999px rgba(30, 16, 60, 0.65)" }}
                className="z-[96] rounded-xl border-2 border-primary"
              />
            )}
            {!rect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[96] bg-[rgba(30,16,60,0.65)]"
              />
            )}

            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              style={rect ? tooltipStyle : undefined}
              className={
                rect
                  ? "z-[97] w-[min(340px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-5 shadow-soft-xl"
                  : "fixed inset-0 z-[97] flex items-center justify-center p-4"
              }
            >
              <div className={rect ? "" : "w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft-xl"}>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    Passo {stepIndex + 1} di {adminTourSteps.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Chiudi la guida"
                    className="cursor-pointer text-foreground/40 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{step.description}</p>

                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={back}
                    disabled={stepIndex === 0}
                    className="flex cursor-pointer items-center gap-1 text-sm font-medium text-foreground/60 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    {isLast ? "Fine" : "Avanti"}
                    {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
