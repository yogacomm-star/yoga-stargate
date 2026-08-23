import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteButton from "@/components/admin/DeleteButton";
import { levelLabel } from "@/lib/levels";

export default async function AdminRitiriPage() {
  const retreats = await prisma.retreat.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Ritiri</h1>
          <p className="mt-1 text-sm text-foreground/60">{retreats.length} ritiri totali</p>
        </div>
        <Link
          href="/admin/ritiri/nuovo"
          data-tour="admin-new-retreat"
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuovo ritiro
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-5 py-3">Titolo</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3">Livello</th>
              <th className="px-5 py-3">Stato</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {retreats.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{r.title}</td>
                <td className="px-5 py-3 text-foreground/70">{r.category}</td>
                <td className="px-5 py-3 text-foreground/70">{levelLabel(r.requiredLevel)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/ritiri/${r.id}`}
                      className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-primary"
                      aria-label="Modifica"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton
                      endpoint={`/api/admin/retreats/${r.id}`}
                      confirmLabel={`Eliminare il ritiro "${r.title}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {retreats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-foreground/50">
                  Nessun ritiro creato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
