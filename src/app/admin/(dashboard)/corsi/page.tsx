import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteButton from "@/components/admin/DeleteButton";
import { levelLabel } from "@/lib/levels";

export default async function AdminCorsiPage() {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Corsi</h1>
          <p className="mt-1 text-sm text-foreground/60">{courses.length} corsi totali</p>
        </div>
        <Link
          href="/admin/corsi/nuovo"
          data-tour="admin-new-course"
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuovo corso
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
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{c.title}</td>
                <td className="px-5 py-3 text-foreground/70">{c.category}</td>
                <td className="px-5 py-3 text-foreground/70">{levelLabel(c.requiredLevel)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/corsi/${c.id}`}
                      className="cursor-pointer rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-primary"
                      aria-label="Modifica"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton endpoint={`/api/admin/courses/${c.id}`} confirmLabel={`Eliminare il corso "${c.title}"?`} />
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-foreground/50">
                  Nessun corso creato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
