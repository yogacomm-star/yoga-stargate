"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export type DashboardStat = {
  label: string;
  value: number;
  hint: string;
  icon: ReactNode;
  href: string;
};

const STORAGE_KEY = "ys-admin-dashboard-seen";

// Confronta i valori attuali con l'ultima visita salvata in localStorage (solo su questo
// browser/dispositivo: sufficiente per un pannello a singola amministratrice) e evidenzia i
// cubotti il cui numero è salito da allora — es. un nuovo messaggio arrivato, un nuovo membro
// registrato. Al primo caricamento in assoluto (nessun valore salvato) non evidenzia nulla,
// altrimenti la prima visita dopo questa modifica apparirebbe tutta "nuova".
function readSeen(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSeen(values: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // localStorage non disponibile (privacy mode, ecc.): l'evidenziazione semplicemente non persiste.
  }
}

export default function DashboardStatsGrid({ stats }: { stats: DashboardStat[] }) {
  const [newLabels, setNewLabels] = useState<Set<string>>(new Set());

  useEffect(() => {
    const previouslySeen = readSeen();
    if (previouslySeen) {
      const changed = new Set<string>();
      for (const s of stats) {
        const prev = previouslySeen[s.label];
        if (prev !== undefined && s.value > prev) changed.add(s.label);
      }
      // localStorage non esiste lato server: leggerlo durante il render (invece che qui,
      // in un effect) darebbe un markup diverso tra SSR e client, cioè un hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewLabels(changed);
    }
    writeSeen(Object.fromEntries(stats.map((s) => [s.label, s.value])));
    // Solo al montaggio: è un confronto "rispetto all'ultima visita", non deve rieseguirsi ad ogni render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-tour="admin-stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => {
        const isNew = newLabels.has(s.label);
        return (
          <Link
            key={s.label}
            href={s.href}
            className={`relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-5 shadow-soft-sm transition-transform hover:-translate-y-1 ${
              isNew ? "border-accent bg-accent/10" : "border-border bg-card"
            }`}
          >
            {isNew && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-accent-foreground uppercase shadow-soft-md"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-1.5 w-1.5 rounded-full bg-accent-foreground"
                  aria-hidden="true"
                />
                Novità
              </motion.span>
            )}
            <div className="flex items-center justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isNew ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                {isNew ? <Sparkles className="h-5 w-5" aria-hidden="true" /> : s.icon}
              </span>
              <span className="font-heading text-2xl font-semibold text-foreground">{s.value}</span>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">{s.label}</p>
              <p className="mt-0.5 text-xs text-foreground/60">{s.hint}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
