import { getStripe } from "@/lib/stripe";
import DiscountForm from "@/components/admin/DiscountForm";
import DeleteButton from "@/components/admin/DeleteButton";

function describeCoupon(coupon: { percent_off?: number | null; amount_off?: number | null; currency?: string | null }): string {
  if (coupon.percent_off) return `-${coupon.percent_off}%`;
  if (coupon.amount_off) return `-${(coupon.amount_off / 100).toLocaleString("it-IT", { style: "currency", currency: coupon.currency?.toUpperCase() ?? "EUR" })}`;
  return "—";
}

export default async function AdminScontiPage() {
  const promotionCodes = await getStripe().promotionCodes.list({ limit: 100, expand: ["data.coupon"] });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Codici sconto</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Crea codici da comunicare ai clienti: si applicano da soli nella pagina di pagamento Stripe dei corsi
          (basta cliccare &quot;Aggiungi codice promozionale&quot; al checkout).
        </p>
      </div>

      <DiscountForm />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-5 py-3">Codice</th>
              <th className="px-5 py-3">Sconto</th>
              <th className="px-5 py-3">Usi</th>
              <th className="px-5 py-3">Scadenza</th>
              <th className="px-5 py-3">Stato</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {promotionCodes.data.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-mono font-medium text-foreground">{p.code}</td>
                <td className="px-5 py-3 text-foreground/70">
                  {typeof p.coupon === "object" ? describeCoupon(p.coupon) : "—"}
                </td>
                <td className="px-5 py-3 text-foreground/70">
                  {p.times_redeemed}
                  {p.max_redemptions ? ` / ${p.max_redemptions}` : ""}
                </td>
                <td className="px-5 py-3 text-foreground/70">
                  {p.expires_at ? new Date(p.expires_at * 1000).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td className="px-5 py-3">
                  {p.active ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Attivo</span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground/50">Disattivato</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {p.active && (
                    <DeleteButton endpoint={`/api/admin/discounts/${p.id}`} confirmLabel="Disattivare questo codice sconto?" />
                  )}
                </td>
              </tr>
            ))}
            {promotionCodes.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-foreground/50">
                  Nessun codice sconto creato ancora.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
