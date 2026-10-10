"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, RotateCcw, Download } from "lucide-react";
import { runCampaign, stoppedMessage, type SendTotals } from "@/lib/campaignClient";

// Azioni sulla pagina di un invio: riprendere chi è rimasto in attesa (limite del servizio email,
// pagina chiusa a metà...), riprovare chi non era stato raggiunto, scaricare l'elenco.
export default function CampaignActions({
  campaignId,
  pending,
  failed,
}: {
  campaignId: string;
  pending: number;
  failed: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<SendTotals | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function resume(requeueFirst: boolean) {
    setBusy(true);
    setMessage(null);
    setProgress(null);
    try {
      if (requeueFirst) {
        const res = await fetch(`/api/admin/email/campaigns/${campaignId}/retry`, { method: "POST" });
        if (!res.ok) throw new Error();
      }
      const outcome = await runCampaign(campaignId, setProgress);
      const warning = stoppedMessage(outcome);
      setMessage(
        warning
          ? { ok: false, text: warning }
          : { ok: true, text: `Fatto: partite ${outcome.sent} email${outcome.failed ? `, ${outcome.failed} non riuscite` : ""}.` }
      );
    } catch {
      setMessage({ ok: false, text: "Qualcosa è andato storto, riprova." });
    } finally {
      setBusy(false);
      setProgress(null);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {pending > 0 && (
          <button
            type="button"
            onClick={() => resume(false)}
            disabled={busy}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Riprendi l&apos;invio ({pending} in attesa)
          </button>
        )}
        {failed > 0 && (
          <button
            type="button"
            onClick={() => resume(true)}
            disabled={busy}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            {failed === 1 ? "Riprova l'indirizzo non riuscito" : `Riprova le ${failed} non riuscite`}
          </button>
        )}
        <a
          href={`/api/admin/email/campaigns/${campaignId}/export`}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/5"
        >
          <Download className="h-4 w-4" />
          Scarica l&apos;elenco (CSV)
        </a>
      </div>
      {progress && <p className="mt-3 text-sm text-foreground/70">Invio in corso… partite {progress.sent}, in attesa {progress.pending < 0 ? "…" : progress.pending}.</p>}
      {message && <p className={`mt-3 text-sm font-medium ${message.ok ? "text-primary" : "text-destructive"}`}>{message.text}</p>}
    </div>
  );
}
