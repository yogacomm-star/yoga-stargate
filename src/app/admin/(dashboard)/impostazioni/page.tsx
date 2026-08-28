import { getAppSettings, getStorageUsedBytes } from "@/lib/storage";
import { r2Configured } from "@/lib/r2";
import { requireAdmin } from "@/lib/auth";
import StorageLimitToggle from "@/components/admin/StorageLimitToggle";
import SiteLockToggle from "@/components/admin/SiteLockToggle";

function formatGb(bytes: number | bigint): string {
  return (Number(bytes) / 1e9).toFixed(2);
}

export default async function AdminImpostazioniPage() {
  const [settings, usedBytes, admin] = await Promise.all([getAppSettings(), getStorageUsedBytes(), requireAdmin()]);
  const limitBytes = settings.storageLimitBytes;
  const usedPct = Math.min(100, (Number(usedBytes) / Number(limitBytes)) * 100);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Impostazioni</h1>
        <p className="mt-1 text-sm text-foreground/60">Configurazione dello storage per immagini e audio.</p>
      </div>

      {admin?.isOwner && (
        <section className="max-w-xl rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Blocco del sito</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Rende l&apos;intero sito (incluso questo pannello admin) inaccessibile a chiunque non abbia il codice
            generato qui sotto. Utile per lavori in corso o manutenzioni.
          </p>
          <div className="mt-5 border-t border-border pt-5">
            <SiteLockToggle initialLocked={settings.siteLocked} />
          </div>
        </section>
      )}

      <section className="max-w-xl rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Spazio di archiviazione (Cloudflare R2)</h2>

        {!r2Configured() && (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Storage non ancora configurato: mancano le variabili R2 nell&apos;ambiente. I caricamenti di immagini e
            audio non funzioneranno finché non sono impostate.
          </p>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/70">
              {formatGb(usedBytes)}GB usati su {formatGb(limitBytes)}GB
            </span>
            <span className="font-semibold text-foreground">{usedPct.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={`h-full rounded-full ${usedPct > 90 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-start justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Blocca i caricamenti oltre il limite gratuito</p>
            <p className="mt-1 text-xs text-foreground/60">
              Quando attivo, impedisce di caricare nuove immagini o audio se si supererebbe il tetto impostato,
              evitando di far scattare i costi a consumo di Cloudflare R2 oltre il piano gratuito (10GB). Disattivalo
              solo se sai che vuoi superare questo limite.
            </p>
          </div>
          <StorageLimitToggle initialEnabled={settings.storageLimitEnabled} />
        </div>
      </section>
    </div>
  );
}
