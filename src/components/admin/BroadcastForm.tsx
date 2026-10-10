"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Send, Eye, EyeOff, Loader2, Paperclip } from "lucide-react";
import { brandedEmail, messageToHtml } from "@/lib/emailTemplate";
import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/emailTemplates";
import FileUploadField from "@/components/admin/FileUploadField";
import { runCampaign, stoppedMessage, type SendTotals } from "@/lib/campaignClient";

export default function BroadcastForm({
  emailConfigured,
  audienceCounts,
}: {
  emailConfigured: boolean;
  audienceCounts: { consenting: number; members: number };
}) {
  const [audience, setAudience] = useState<"consenting" | "members">("consenting");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [button1Label, setButton1Label] = useState("Prenota");
  const [button1Url, setButton1Url] = useState("");
  const [button2Label, setButton2Label] = useState("Scopri di più");
  const [button2Url, setButton2Url] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>();
  const [showPreview, setShowPreview] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "testing" | "done" | "error">("idle");
  const [result, setResult] = useState<{ campaignId: string; total: number; sent: number; failed: number; pending: number; warning: string | null } | null>(null);
  const [progress, setProgress] = useState<SendTotals & { total: number } | null>(null);
  const [testSentTo, setTestSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(key: EmailTemplateKey | "") {
    if (!key) return;
    const template = EMAIL_TEMPLATES[key];
    setSubject(template.subject);
    setMessage(template.message);
  }

  const buttons = useMemo(
    () =>
      [
        button1Url.trim() ? { label: button1Label.trim() || "Prenota", url: button1Url.trim() } : null,
        button2Url.trim() ? { label: button2Label.trim() || "Scopri di più", url: button2Url.trim() } : null,
      ].filter((b): b is { label: string; url: string } => b !== null),
    [button1Label, button1Url, button2Label, button2Url]
  );

  function buildPayload(test: boolean) {
    return {
      audience,
      subject,
      message,
      ...(buttons.length ? { buttons } : {}),
      ...(attachmentUrl ? { attachmentUrl } : {}),
      test,
    };
  }

  const recipientCount = audience === "consenting" ? audienceCounts.consenting : audienceCounts.members;

  async function send(test: boolean) {
    if (
      !test &&
      !window.confirm(
        `Inviare questa email a ${recipientCount} ${recipientCount === 1 ? "persona" : "persone"}? L'azione non può essere annullata.`
      )
    )
      return;
    setStatus(test ? "testing" : "loading");
    setError(null);
    setResult(null);
    setTestSentTo(null);
    setProgress(null);
    try {
      const res = await fetch("/api/admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(test)),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'invio.");
        setStatus("error");
        return;
      }
      if (test) {
        setTestSentTo(data.to);
        setStatus("idle");
        return;
      }

      // Newsletter vera: l'elenco dei destinatari è già fissato e registrato; si spedisce a gruppi.
      const total: number = data.total;
      setProgress({ sent: 0, failed: 0, pending: total, total });
      const outcome = await runCampaign(data.campaignId, (t) => setProgress({ ...t, total }));
      setResult({
        campaignId: data.campaignId,
        total,
        sent: outcome.sent,
        failed: outcome.failed,
        pending: outcome.pending < 0 ? total : outcome.pending,
        warning: stoppedMessage(outcome),
      });
      setProgress(null);
      setStatus("done");
      if (!outcome.stopped && outcome.pending === 0) {
        setSubject("");
        setMessage("");
        setButton1Url("");
        setButton2Url("");
        setAttachmentUrl(undefined);
      }
    } catch {
      setError("Errore di rete, riprova.");
      setStatus("error");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await send(false);
  }

  const previewHtml = useMemo(
    () =>
      brandedEmail({
        title: subject || "Oggetto dell'email",
        bodyHtml: messageToHtml(message) || '<p style="margin:0;color:#94a3b8;">Il testo del messaggio apparirà qui...</p>',
        buttons,
      }),
    [subject, message, buttons]
  );

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  const busy = status === "loading" || status === "testing";

  return (
    <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : ""}`}>
      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        {!emailConfigured && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Invio email non ancora configurato: aggiungi <code className="font-mono">RESEND_API_KEY</code> nelle
            variabili d&apos;ambiente per attivarlo. Puoi comunque preparare il messaggio.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="broadcast-template" className="mb-1 block text-sm font-medium text-foreground">
              Parti da un modello (facoltativo)
            </label>
            <select
              id="broadcast-template"
              defaultValue=""
              onChange={(e) => applyTemplate(e.target.value as EmailTemplateKey | "")}
              className={inputClass}
            >
              <option value="">Scrivi da zero...</option>
              {Object.entries(EMAIL_TEMPLATES).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="broadcast-audience" className="mb-1 block text-sm font-medium text-foreground">
              Destinatari
            </label>
            <select
              id="broadcast-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
              className={inputClass}
            >
              <option value="consenting">Membri che hanno dato il consenso email ({audienceCounts.consenting})</option>
              <option value="members">Tutti i membri registrati ({audienceCounts.members})</option>
            </select>
            {audience === "members" && (
              <p className="mt-1 text-xs text-foreground/50">
                Include anche chi non ha dato il consenso a ricevere comunicazioni promozionali: usa questa opzione
                solo per comunicazioni essenziali legate all&apos;account, non per contenuti di marketing.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="broadcast-subject" className="mb-1 block text-sm font-medium text-foreground">
              Oggetto
            </label>
            <input
              id="broadcast-subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="broadcast-message" className="block text-sm font-medium text-foreground">
                Messaggio
              </label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary lg:hidden"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "Nascondi anteprima" : "Mostra anteprima"}
              </button>
            </div>
            <textarea
              id="broadcast-message"
              required
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi qui il testo dell'email. Lascia una riga vuota per andare a capo con un nuovo paragrafo."
              className={inputClass}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-foreground">
              Pulsanti (facoltativi) <span className="font-normal text-foreground/50">— es. verso un evento o un corso</span>
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <input
                  aria-label="Testo del primo pulsante"
                  value={button1Label}
                  onChange={(e) => setButton1Label(e.target.value)}
                  className={inputClass}
                />
                <input
                  aria-label="Link del primo pulsante"
                  placeholder="https://www.yogastargate.com/eventi/..."
                  value={button1Url}
                  onChange={(e) => setButton1Url(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <input
                  aria-label="Testo del secondo pulsante"
                  value={button2Label}
                  onChange={(e) => setButton2Label(e.target.value)}
                  disabled={!button1Url.trim()}
                  className={inputClass + " disabled:cursor-not-allowed disabled:opacity-50"}
                />
                <input
                  aria-label="Link del secondo pulsante"
                  placeholder="https://www.yogastargate.com/corsi/..."
                  value={button2Url}
                  onChange={(e) => setButton2Url(e.target.value)}
                  disabled={!button1Url.trim()}
                  className={inputClass + " disabled:cursor-not-allowed disabled:opacity-50"}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-foreground/50">
              Lascia vuoto il link per non mostrare il pulsante. Il secondo pulsante compare solo se c&apos;è già il
              primo. Incolla l&apos;indirizzo della pagina dell&apos;evento o del corso dal sito.
            </p>
          </div>

          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              Allega un file (facoltativo)
            </p>
            <FileUploadField fileUrl={attachmentUrl} isPrivate={false} onChange={(r) => setAttachmentUrl(r.fileUrl)} />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {testSentTo && (
            <p className="text-sm font-medium text-primary">
              Email di prova inviata a {testSentTo}. Controlla la casella (anche lo spam).
            </p>
          )}
          {progress && (
            <div className="rounded-lg border border-border bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">
                Invio in corso… {progress.sent} su {progress.total}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress.total ? (progress.sent / progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-foreground/60">Non chiudere questa pagina finché non finisce.</p>
            </div>
          )}
          {result && (
            <div className="rounded-lg border border-border bg-muted p-3 text-sm">
              <p className="font-medium text-primary">
                Inviata a {result.sent} persone su {result.total}
                {result.failed > 0 ? ` · ${result.failed} non raggiunte` : ""}
                {result.pending > 0 ? ` · ${result.pending} in attesa` : ""}.
              </p>
              {result.warning && <p className="mt-2 text-destructive">{result.warning}</p>}
              <Link
                href={`/admin/email/${result.campaignId}`}
                className="mt-2 inline-block cursor-pointer font-semibold text-primary underline underline-offset-2"
              >
                Vedi chi l&apos;ha ricevuta e le statistiche →
              </Link>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => send(true)}
              disabled={busy || !subject || !message}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "testing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              Invia una prova a me
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {status === "loading" ? "Invio in corso..." : `Invia a ${recipientCount} ${recipientCount === 1 ? "persona" : "persone"}`}
            </button>
          </div>
          <p className="text-xs text-foreground/50">
            Prova sempre l&apos;email prima di inviarla a tutti: &quot;Invia una prova a me&quot; manda esattamente
            questo messaggio (testo, pulsanti e allegato) solo al tuo indirizzo.
          </p>
        </form>
      </div>

      {showPreview && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-foreground/50 uppercase">Anteprima</p>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-soft-sm">
            <iframe title="Anteprima email" srcDoc={previewHtml} className="h-[480px] w-full lg:h-[640px]" sandbox="" />
          </div>
        </div>
      )}
    </div>
  );
}
