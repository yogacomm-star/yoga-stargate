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
        Le email per nuovi eventi e articoli vengono inviate automaticamente quando pubblichi un contenuto.
      </p>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-foreground">Invia una newsletter</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Scrivi un&apos;email a tutti gli iscritti o ai membri registrati. Prima di inviarla a tutti, usa sempre
          &quot;Invia una prova a me&quot; per vederla esattamente com&apos;è.
        </p>
        <div className="mt-4">
          <BroadcastForm emailConfigured={emailConfigured()} />
        </div>
      </div>

      {/* Scompare da sola quando non resta più nessuno da invitare: è un compito legato
          all'importazione dei vecchi contatti, non uno strumento per le newsletter di tutti i
          giorni, ed è facile confonderlo con la sezione sopra se resta visibile per sempre. */}
      {pending > 0 && (
        <div className="mt-10 border-t border-border pt-8">
          <InviteImportedCard initialPending={pending} emailConfigured={emailConfigured()} />
        </div>
      )}
    </div>
  );
}
