"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "ys_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function choose(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-card/95 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-5 sm:flex-row sm:px-6">
            <Cookie className="hidden h-8 w-8 shrink-0 text-primary sm:block" aria-hidden="true" />
            <p className="flex-1 text-center text-sm text-foreground/80 sm:text-left">
              Usiamo cookie tecnici necessari al funzionamento del sito (es. login). Nessun cookie di profilazione o
              tracciamento pubblicitario. Leggi la nostra{" "}
              <Link href="/cookie" className="cursor-pointer font-semibold text-primary underline underline-offset-2">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => choose("rejected")}
                className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground/70 hover:border-primary"
              >
                Rifiuta
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Accetta
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
