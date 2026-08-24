import { OCCASIONAL_WORK_LIMIT } from "@/lib/revenue";

export default function RevenueBar({
  total,
  year,
  allTimeTotal,
  compact = false,
}: {
  total: number;
  year: number;
  allTimeTotal?: number;
  compact?: boolean;
}) {
  const pct = Math.min(100, (total / OCCASIONAL_WORK_LIMIT) * 100);
  const overLimit = total > OCCASIONAL_WORK_LIMIT;

  const bar = (
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

  if (allTimeTotal == null) return bar;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1">{bar}</div>
      <div className="shrink-0 rounded-xl border border-border bg-background px-4 py-3 text-center sm:text-left">
        <p className="text-xs whitespace-nowrap text-foreground/50">Fatturato totale</p>
        <p className="font-heading text-lg font-semibold whitespace-nowrap text-foreground">
          {allTimeTotal.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
        </p>
      </div>
    </div>
  );
}
