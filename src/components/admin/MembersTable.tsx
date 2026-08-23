"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import LevelSelect from "@/components/admin/LevelSelect";
import MemberPasswordActions from "@/components/admin/MemberPasswordActions";
import DeleteButton from "@/components/admin/DeleteButton";

export type MemberRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  level: number;
  createdAt: string;
};

export default function MembersTable({ members }: { members: MemberRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground/40" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o email..."
          aria-label="Cerca membri"
          className="w-full rounded-lg border border-border bg-background py-2.5 pr-4 pl-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/95 text-xs uppercase text-foreground/50 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Telefono</th>
                <th className="px-5 py-3">Registrato il</th>
                <th className="px-5 py-3">Livello</th>
                <th className="px-5 py-3">Password</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{m.name}</td>
                  <td className="px-5 py-3 text-foreground/70">{m.email}</td>
                  <td className="px-5 py-3 text-foreground/70">{m.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-foreground/70">
                    {new Date(m.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <LevelSelect accountId={m.id} initialLevel={m.level} />
                  </td>
                  <td className="px-5 py-3">
                    <MemberPasswordActions accountId={m.id} />
                  </td>
                  <td className="px-5 py-3">
                    <DeleteButton
                      endpoint={`/api/admin/users/${m.id}`}
                      confirmLabel={`Eliminare definitivamente l'account di ${m.name}? L'operazione non è reversibile.`}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-foreground/50">
                    {members.length === 0 ? "Nessun membro registrato." : "Nessun membro trovato per questa ricerca."}
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
