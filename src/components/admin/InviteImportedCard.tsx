"use client";

import { useState } from "react";
import { Loader2, Send, MailCheck } from "lucide-react";

// Invito ai contatti importati dal vecchio sito: prima si manda una prova a sé stessi per vedere
// l'email, poi si invia a tutti. L'invio avviene a gruppi (il server ne manda una cinquantina per
// volta): il pulsante richiama finché non ne restano, mostrando l'avanzamento.
export default function InviteImportedCard({
  initialPending,
  emailConfigured,
}: {
  initialPending: number;
  emailConfigured: boolean;
}) {
  const [pending, setPending] = useState(initialPending);
  const [sentTotal, setSentTotal] = useState(0);
  const [busy, setBusy] = useState<"test" | "send" | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [failed, setFailed] = useState<string[]>([]);

  async function sendTest() {
    setBusy("test");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(
        res.ok
          ? { ok: true, text: `Email di prova inviata a ${data.to}. Controlla la casella (anche lo spam).` }
          : { ok: false, text: data.error ?? "Invio della prova non riuscito." }
      );
    } catch {
      setMessage({ ok: false, text: "Errore di rete, riprova." });
    } finally {
      setBusy(null);
    }
  }

  async function sendAll() {
    if (
      !window.confirm(
        `Inviare l'invito a ${pending} contatti? Ognuno riceverà l'email con il link per scegliere la password. L'operazione non si può annullare.`
      )
    )
      return;

    setBusy("send");
    setMessage(null);
    setFailed([]);
    let total = 0;
    const allFailed: string[] = [];
    try {
      // Un giro per gruppo, finché il server dice che non resta nessuno (con un tetto di sicurezza).
      for (let i = 0; i < 40; i++) {
        const res = await fetch("/api/admin/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage({ ok: false, text: `${data.error ?? "Invio interrotto."} Inviati finora: ${total}. Puoi riprovare: riprende da dove si è fermato.` });
          if (typeof data.remaining === "number") setPending(data.remaining);
          return;
        }
        total += data.sent;
        if (Array.isArray(data.failed)) allFailed.push(...data.failed);
        setSentTotal(total);
        setFailed([...allFailed]);
        setPending(data.remaining);
        if (data.remaining === 0) break;
        // Una breve pausa tra un gruppo e l'altro: resta sotto i limiti di frequenza del servizio email.
        await new Promise((r) => setTimeout(r, 1200));
      }
      setMessage({ ok: true, text: `Fatto: inviati ${total} inviti.` });
    } catch {
      setMessage({ ok: false, text: `Errore di rete dopo ${total} inviti. Puoi riprovare: riprende da dove si è fermato.` });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
        <MailCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        Invito ai contatti del vecchio sito
      </h2>
      <p className="mt-1 text-sm text-foreground/60">
        Le persone già presenti nella lista del vecchio sito hanno un account pronto, senza password. Con questo
        invito ricevono un&apos;email che spiega che il sito sta cambiando e un link personale (valido 30 giorni) per
        scegliere la loro password. Ognuno lo riceve una sola volta.
      </p>

      <p className="mt-4 text-sm font-semibold text-foreground">
        {pending === 0
          ? sentTotal > 0
            ? "Tutti i contatti sono stati invitati."
            : "Nessun contatto in attesa di invito."
          : `${pending} contatti in attesa di invito`}
      </p>

      {!emailConfigured && (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          L&apos;invio delle email non è configurato: gli inviti non possono partire.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={sendTest}
          disabled={!emailConfigured || busy !== null}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Invia una prova a me
        </button>
        <button
          type="button"
          onClick={sendAll}
          disabled={!emailConfigured || busy !== null || pending === 0}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {busy === "send" ? `Invio in corso… (${sentTotal})` : `Invia a tutti (${pending})`}
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-sm font-medium ${message.ok ? "text-primary" : "text-destructive"}`}>{message.text}</p>
      )}
      {failed.length > 0 && (
        <div className="mt-3 rounded-lg border border-border bg-muted p-3 text-sm text-foreground/80">
          <p className="font-semibold">
            {failed.length} {failed.length === 1 ? "indirizzo rifiutato" : "indirizzi rifiutati"} (non validi), saltati:
          </p>
          <p className="mt-1 break-all text-xs">{failed.join(", ")}</p>
        </div>
      )}
    </section>
  );
}
