import BroadcastForm from "@/components/admin/BroadcastForm";
import { emailConfigured } from "@/lib/email";

export default function AdminEmailPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Email</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Invia un&apos;email a tutti gli iscritti o ai membri registrati. Le email per nuovi ritiri e articoli
        vengono inviate automaticamente quando pubblichi un contenuto.
      </p>
      <div className="mt-6">
        <BroadcastForm emailConfigured={emailConfigured()} />
      </div>
    </div>
  );
}
