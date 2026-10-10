// Parte "browser" dell'invio newsletter: richiama il server un gruppo alla volta finché non resta
// nessuno in attesa (o il servizio email dice di fermarsi), riportando l'avanzamento.
export type SendTotals = { sent: number; failed: number; pending: number };
export type SendResult = SendTotals & { stopped?: "quota" | "rate" | "error"; message?: string };

const MAX_ROUNDS = 60; // 60 gruppi da 100 = 6000 email: oltre, si riprende con un secondo clic
const RATE_LIMIT_PAUSE_MS = 4000;
const MAX_RATE_LIMIT_PAUSES = 6;

export async function runCampaign(campaignId: string, onProgress: (t: SendTotals) => void): Promise<SendResult> {
  const totals: SendTotals = { sent: 0, failed: 0, pending: -1 };
  let ratePauses = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let data: { sent?: number; failed?: number; pending?: number; stopped?: SendResult["stopped"]; message?: string; error?: string };
    try {
      const res = await fetch(`/api/admin/email/campaigns/${campaignId}/send`, { method: "POST" });
      data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ...totals, stopped: "error", message: data.error ?? "Errore durante l'invio." };
      }
    } catch {
      return { ...totals, stopped: "error", message: "Errore di rete: l'invio si è interrotto." };
    }

    totals.sent += data.sent ?? 0;
    totals.failed += data.failed ?? 0;
    totals.pending = data.pending ?? totals.pending;
    onProgress({ ...totals });

    if (data.stopped === "rate") {
      if (++ratePauses > MAX_RATE_LIMIT_PAUSES) return { ...totals, stopped: "rate", message: data.message };
      await new Promise((r) => setTimeout(r, RATE_LIMIT_PAUSE_MS));
      continue;
    }
    if (data.stopped) return { ...totals, stopped: data.stopped, message: data.message };
    if (totals.pending === 0) return totals;
  }
  return totals;
}

export function stoppedMessage(r: SendResult): string | null {
  if (!r.stopped) return null;
  if (r.stopped === "quota") {
    return `Il servizio email ha raggiunto il suo limite di invii (giornaliero o mensile). Sono partite ${r.sent} email in questa sessione, ${r.pending} restano in attesa: nessuna andrà persa né verrà inviata due volte. Riprendi l'invio più tardi dalla pagina dell'invio, oppure passa a un piano senza limite giornaliero.`;
  }
  if (r.stopped === "rate") {
    return `Il servizio email sta limitando la velocità di invio. Sono partite ${r.sent} email, ${r.pending} restano in attesa: riprendi tra qualche minuto dalla pagina dell'invio.`;
  }
  return `${r.message ?? "Invio interrotto."} Partite ${r.sent}, in attesa ${r.pending}: puoi riprendere dalla pagina dell'invio.`;
}
