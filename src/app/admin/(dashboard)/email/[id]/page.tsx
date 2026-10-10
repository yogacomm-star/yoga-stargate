import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CampaignActions from "@/components/admin/CampaignActions";
import { parseButtons, statsFor } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; className: string }> = {
  SENT: { label: "Inviata", className: "text-primary" },
  FAILED: { label: "Non riuscita", className: "text-destructive" },
  PENDING: { label: "In attesa", className: "text-foreground/50" },
};

const pct = (n: number, of: number) => (of > 0 ? `${Math.round((n / of) * 100)}%` : "–");
const when = (d: Date | null) =>
  d ? d.toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold tracking-wide text-foreground/50 uppercase">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ esito?: string }>;
}) {
  const { id } = await params;
  const { esito } = await searchParams;

  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  const filter = esito && ["SENT", "FAILED", "PENDING"].includes(esito) ? esito : undefined;
  const [stats, recipients] = await Promise.all([
    statsFor([id]).then((m) => m.get(id)!),
    prisma.emailCampaignRecipient.findMany({
      where: { campaignId: id, ...(filter ? { status: filter } : {}) },
      orderBy: [{ status: "asc" }, { email: "asc" }],
      take: 1000,
    }),
  ]);
  const buttons = parseButtons(campaign.buttons);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/email" className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" /> Tutte le email
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">{campaign.subject}</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Inviata il{" "}
          {campaign.createdAt.toLocaleString("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}{" "}
          a {campaign.audience === "consenting" ? "chi ha dato il consenso email" : "tutti i membri"}
          {campaign.attachmentUrl ? " · con allegato" : ""}.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Destinatari" value={stats.total} />
        <Stat label="Raggiunti" value={stats.sent} hint={stats.total ? `${pct(stats.sent, stats.total)} del totale` : undefined} />
        <Stat label="Non raggiunti" value={stats.failed + stats.pending} hint={stats.pending ? `${stats.pending} ancora in attesa` : undefined} />
        <Stat label="Disiscritti" value={stats.unsubscribed} hint={`${pct(stats.unsubscribed, stats.sent)} dei raggiunti`} />
        <Stat label="Hanno aperto" value={stats.opened} hint={`${pct(stats.opened, stats.sent)} dei raggiunti · indicativo`} />
        <Stat label="Hanno cliccato" value={stats.clicked} hint={`${pct(stats.clicked, stats.sent)} dei raggiunti`} />
        {buttons.map((b, i) => (
          <Stat
            key={i}
            label={`Clic su “${b.label}”`}
            value={i === 0 ? stats.clickedButton1 : stats.clickedButton2}
            hint={`${pct(i === 0 ? stats.clickedButton1 : stats.clickedButton2, stats.sent)} dei raggiunti`}
          />
        ))}
      </section>

      <p className="-mt-4 text-xs text-foreground/50">
        Le aperture sono indicative: alcuni programmi di posta (come Apple Mail) caricano le immagini in anticipo, altri
        le bloccano. I clic e le disiscrizioni invece sono conteggi precisi.
      </p>

      <CampaignActions campaignId={id} pending={stats.pending} failed={stats.failed} />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">Chi ha ricevuto l&apos;email</h2>
          <div className="flex gap-2 text-sm">
            {[
              { key: undefined, label: "Tutti" },
              { key: "SENT", label: "Raggiunti" },
              { key: "FAILED", label: "Non riusciti" },
              { key: "PENDING", label: "In attesa" },
            ].map((f) => (
              <Link
                key={f.label}
                href={f.key ? `/admin/email/${id}?esito=${f.key}` : `/admin/email/${id}`}
                className={`cursor-pointer rounded-full border px-3 py-1 font-medium ${
                  filter === f.key ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/70 hover:border-primary"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Esito</th>
                <th className="px-4 py-3">Aperta</th>
                <th className="px-4 py-3">Clic</th>
                <th className="px-4 py-3">Disiscritta/o</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">{r.name}</td>
                  <td className="px-4 py-2.5 text-foreground/70">{r.email}</td>
                  <td className="px-4 py-2.5">
                    <span className={`font-medium ${STATUS[r.status]?.className ?? ""}`}>{STATUS[r.status]?.label ?? r.status}</span>
                    {r.error && <span className="block text-xs text-foreground/50">{r.error}</span>}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-foreground/70">{when(r.openedAt)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-foreground/70">{when(r.clickedAt)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-foreground/70">{when(r.unsubscribedAt)}</td>
                </tr>
              ))}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                    Nessuno in questo elenco.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {recipients.length === 1000 && (
          <p className="mt-2 text-xs text-foreground/50">Mostrati i primi 1000: l&apos;elenco completo è nel file CSV.</p>
        )}
      </section>
    </div>
  );
}
