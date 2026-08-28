import { prisma } from "@/lib/prisma";
import MembersTable, { type MemberRow } from "@/components/admin/MembersTable";
import CreateMemberForm from "@/components/admin/CreateMemberForm";

export default async function AdminUtentiPage() {
  const members = await prisma.account.findMany({ where: { role: "MEMBER" }, orderBy: { createdAt: "desc" } });

  const memberRows: MemberRow[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    level: m.level,
    marketingConsent: m.marketingConsent,
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
    </div>
  );
}
