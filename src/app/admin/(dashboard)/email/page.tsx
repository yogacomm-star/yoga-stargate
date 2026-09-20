import BroadcastForm from "@/components/admin/BroadcastForm";
import InviteImportedCard from "@/components/admin/InviteImportedCard";
import { emailConfigured } from "@/lib/email";
import { countPendingInvites } from "@/lib/invitations";

// Contatore sempre aggiornato: dopo un invio la pagina deve riflettere chi resta da invitare.
export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  const pending = await countPendingInvites();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Email</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Invia un&apos;email a tutti gli iscritti o ai membri registrati. Le email per nuovi eventi e articoli
        vengono inviate automaticamente quando pubblichi un contenuto.
      </p>
      <div className="mt-6 space-y-8">
        <InviteImportedCard initialPending={pending} emailConfigured={emailConfigured()} />
        <BroadcastForm emailConfigured={emailConfigured()} />
      </div>
    </div>
  );
}
