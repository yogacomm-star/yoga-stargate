import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import MembersTable, { type MemberRow } from "@/components/admin/MembersTable";
import CreateMemberForm from "@/components/admin/CreateMemberForm";

export default async function AdminUtentiPage() {
  const [members, leads, subscribers] = await Promise.all([
    prisma.account.findMany({ where: { role: "MEMBER" }, orderBy: { createdAt: "desc" } }),
    prisma.contactLead.findMany({ include: { retreat: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const memberRows: MemberRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    level: m.level,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Utenti</h1>
        <p className="mt-1 text-sm text-foreground/60">Gestisci il livello di ogni membro registrato.</p>
      </div>

      <section data-tour="admin-members">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">Membri ({members.length})</h2>
          <CreateMemberForm />
        </div>
        <div className="mt-4">
          <MembersTable members={memberRows} />
        </div>
      </section>

      <section data-tour="admin-leads">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Richieste ricevute</h2>
          <a
            href="/api/admin/export/leads"
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Esporta CSV
          </a>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/95 text-xs uppercase text-foreground/50 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Ritiro</th>
                <th className="px-5 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{l.name}</td>
                  <td className="px-5 py-3 text-foreground/70">{l.email}</td>
                  <td className="px-5 py-3 text-foreground/70">{l.retreat?.title ?? "—"}</td>
                  <td className="px-5 py-3 text-foreground/70">
                    {l.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-foreground/50">
                    Nessuna richiesta ricevuta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      <section data-tour="admin-newsletter">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Iscritti alla newsletter</h2>
          <a
            href="/api/admin/export/newsletter"
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Esporta CSV
          </a>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/95 text-xs uppercase text-foreground/50 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Iscritto il</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{s.email}</td>
                  <td className="px-5 py-3 text-foreground/70">
                    {s.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-foreground/50">
                    Nessun iscritto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>
    </div>
  );
}
