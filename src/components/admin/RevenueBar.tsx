import { OCCASIONAL_WORK_LIMIT } from "@/lib/revenue";

export default function RevenueBar({ total, year, compact = false }: { total: number; year: number; compact?: boolean }) {
  const pct = Math.min(100, (total / OCCASIONAL_WORK_LIMIT) * 100);
  const overLimit = total > OCCASIONAL_WORK_LIMIT;

  return (
    <div>
      <div className={`flex items-baseline justify-between ${compact ? "text-xs" : "text-sm"}`}>
        <span className="font-semibold text-foreground">
          {total.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
        </span>
        <span className="text-foreground/50">
          su {OCCASIONAL_WORK_LIMIT.toLocaleString("it-IT")}€ · {year}
        </span>
      </div>
      <div className={`mt-1.5 overflow-hidden rounded-full bg-foreground/10 ${compact ? "h-1.5" : "h-2"}`}>
        <div
          className={`h-full rounded-full transition-all ${overLimit ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {overLimit && (
        <p className="mt-1 text-xs font-medium text-destructive">Hai superato la soglia delle prestazioni occasionali.</p>
      )}
    </div>
  );
}
