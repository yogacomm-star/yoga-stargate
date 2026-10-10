import Link from "next/link";
import BroadcastForm from "@/components/admin/BroadcastForm";
import { emailConfigured } from "@/lib/email";
import { audienceCounts, statsFor, type CampaignStats } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";

// Contatori sempre aggiornati: dopo un invio la pagina deve riflettere le statistiche.
export const dynamic = "force-dynamic";

const pct = (n: number, of: number) => (of > 0 ? `${Math.round((n / of) * 100)}%` : "–");

async function loadHistory() {
  try {
    const campaigns = await prisma.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
    const stats = await statsFor(campaigns.map((c) => c.id));
    return { campaigns, stats, error: false as const };
  } catch {
    // Tabelle non ancora create nel database (migrazione da eseguire): la pagina deve restare usabile.
    return { campaigns: [], stats: new Map<string, CampaignStats>(), error: true as const };
  }
}

export default async function AdminEmailPage() {
  const [counts, history] = await Promise.all([audienceCounts(), loadHistory()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Email</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Le email per nuovi eventi e articoli non partono più da sole: scrivi tu la newsletter qui sotto e scegli quando
        inviarla.
      </p>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">Invia una newsletter</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Scrivi un&apos;email a tutti gli iscritti o ai membri registrati. Prima di inviarla a tutti, usa sempre
          &quot;Invia una prova a me&quot; per vederla esattamente com&apos;è.
        </p>
        <div className="mt-4">
          <BroadcastForm emailConfigured={emailConfigured()} audienceCounts={counts} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-foreground">Email inviate e statistiche</h2>
        {history.error ? (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Il registro degli invii non è ancora attivo: manca un aggiornamento del database. Finché non viene
            eseguito, la newsletter non può essere inviata.
          </p>
        ) : history.campaigns.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">Ancora nessuna email inviata da qui.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Oggetto</th>
                  <th className="px-4 py-3">Raggiunti</th>
                  <th className="px-4 py-3">Aperture</th>
                  <th className="px-4 py-3">Clic</th>
                  <th className="px-4 py-3">Disiscritti</th>
                </tr>
              </thead>
              <tbody>
                {history.campaigns.map((c) => {
                  const s = history.stats.get(c.id)!;
                  const missing = s.failed + s.pending;
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap text-foreground/70">
                        {c.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/email/${c.id}`} className="cursor-pointer font-semibold text-primary">
                          {c.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {s.sent} / {s.total}
                        {missing > 0 && <span className="ml-2 text-xs font-semibold text-destructive">{missing} mancano</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.opened} <span className="text-foreground/50">({pct(s.opened, s.sent)})</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.clicked} <span className="text-foreground/50">({pct(s.clicked, s.sent)})</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.unsubscribed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
