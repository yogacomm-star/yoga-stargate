import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LEAD_SOURCES } from "@/lib/leadSources";

export default async function AdminMessaggiPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;
  const activeSource = source && (LEAD_SOURCES as readonly string[]).includes(source) ? source : undefined;

  const [leads, total, counts] = await Promise.all([
    prisma.contactLead.findMany({
      where: activeSource ? { source: activeSource } : undefined,
      include: { retreat: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactLead.count(),
    Promise.all(LEAD_SOURCES.map((s) => prisma.contactLead.count({ where: { source: s } }))),
  ]);
  const countBySource = Object.fromEntries(LEAD_SOURCES.map((s, i) => [s, counts[i]]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Messaggi</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Tutte le richieste ricevute dal sito, divise per provenienza così è subito chiaro di cosa parlano.
          </p>
        </div>
        <a
          href={`/api/admin/export/leads${activeSource ? `?source=${encodeURIComponent(activeSource)}` : ""}`}
          className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Esporta CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/messaggi"
          className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeSource ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
          }`}
        >
          Tutti ({total})
        </Link>
        {LEAD_SOURCES.map((s) => (
          <Link
            key={s}
            href={`/admin/messaggi?source=${encodeURIComponent(s)}`}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeSource === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
            }`}
          >
            {s} ({countBySource[s]})
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="max-h-[32rem] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/95 text-xs uppercase text-foreground/50 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Contatti</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Ritiro / Gruppo</th>
                <th className="px-5 py-3">Messaggio</th>
                <th className="px-5 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border align-top last:border-0">
                  <td className="px-5 py-3 font-medium whitespace-nowrap text-foreground">{l.name}</td>
                  <td className="px-5 py-3 text-foreground/70">
                    <div>{l.email}</div>
                    {l.phone && <div className="text-xs text-foreground/50">{l.phone}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="badge-level whitespace-nowrap">{l.source}</span>
                  </td>
                  <td className="px-5 py-3 text-foreground/70">
                    {l.retreat?.title ?? (l.groupSize ? `Gruppo privato (${l.groupSize} persone)` : "—")}
                  </td>
                  <td className="px-5 py-3 max-w-sm text-foreground/70">{l.message}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-foreground/70">
                    {l.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-foreground/50">
                    Nessun messaggio ricevuto{activeSource ? " in questa categoria" : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
