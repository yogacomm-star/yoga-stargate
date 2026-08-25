import { prisma } from "@/lib/prisma";
import { getYearToDateRevenue, getAllTimeRevenue } from "@/lib/revenue";
import RevenueBar from "@/components/admin/RevenueBar";
import AddSaleForm from "@/components/admin/AddSaleForm";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminVenditePage() {
  const [{ total, year }, allTimeTotal, sales, coursePurchases] = await Promise.all([
    getYearToDateRevenue(),
    getAllTimeRevenue(),
    prisma.manualSale.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.coursePurchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { account: { select: { name: true, email: true } } },
    }),
  ]);

  const courseTitles = Object.fromEntries(
    (
      await prisma.course.findMany({
        where: { id: { in: coursePurchases.map((p) => p.courseId) } },
        select: { id: true, title: true },
      })
    ).map((c) => [c.id, c.title])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Vendite dal vivo</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Registra qui i pagamenti ricevuti di persona (contanti, bonifico, ecc.) fuori dal sito.
        </p>
      </div>

      <section className="max-w-xl rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-base font-semibold text-foreground">Fatturato {year}</h2>
        <div className="mt-4">
          <RevenueBar total={total} year={year} allTimeTotal={allTimeTotal} />
        </div>
      </section>

      <AddSaleForm />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-5 py-3">Importo</th>
              <th className="px-5 py-3">Nota</th>
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">
                  {s.amount.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                </td>
                <td className="px-5 py-3 text-foreground/70">{s.description ?? "—"}</td>
                <td className="px-5 py-3 text-foreground/70">
                  {s.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3">
                  <DeleteButton endpoint={`/api/admin/sales/${s.id}`} confirmLabel="Eliminare questa vendita?" />
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-foreground/50">
                  Nessuna vendita registrata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Acquisti corsi (Stripe)</h2>
        <p className="mt-1 text-sm text-foreground/60">Pagamenti online riusciti, sbloccati automaticamente.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-5 py-3">Importo</th>
              <th className="px-5 py-3">Corso</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {coursePurchases.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">
                  {p.amount.toLocaleString("it-IT", { style: "currency", currency: "EUR" })}
                </td>
                <td className="px-5 py-3 text-foreground/70">{courseTitles[p.courseId] ?? "—"}</td>
                <td className="px-5 py-3 text-foreground/70">{p.account.name} ({p.account.email})</td>
                <td className="px-5 py-3 text-foreground/70">
                  {p.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {coursePurchases.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-foreground/50">
                  Nessun acquisto online ancora.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
