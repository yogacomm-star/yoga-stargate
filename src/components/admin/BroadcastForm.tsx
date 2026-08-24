"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Send, Eye, EyeOff } from "lucide-react";
import { brandedEmail, messageToHtml } from "@/lib/emailTemplate";
import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/emailTemplates";

export default function BroadcastForm({ emailConfigured }: { emailConfigured: boolean }) {
  const [audience, setAudience] = useState<"consenting" | "members">("consenting");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ total: number; sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(key: EmailTemplateKey | "") {
    if (!key) return;
    const template = EMAIL_TEMPLATES[key];
    setSubject(template.subject);
    setMessage(template.message);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!window.confirm("Confermi l'invio di questa email? L'azione non può essere annullata.")) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'invio.");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
      setSubject("");
      setMessage("");
    } catch {
      setError("Errore di rete, riprova.");
      setStatus("error");
    }
  }

  const previewHtml = useMemo(
    () =>
      brandedEmail({
        title: subject || "Oggetto dell'email",
        bodyHtml: messageToHtml(message) || '<p style="margin:0;color:#94a3b8;">Il testo del messaggio apparirà qui...</p>',
      }),
    [subject, message]
  );

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

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
              <option value="consenting">Membri che hanno dato il consenso email</option>
              <option value="members">Tutti i membri registrati</option>
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

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {result && (
            <p className="text-sm font-medium text-primary">
              Inviata a {result.sent} destinatari su {result.total}
              {result.failed > 0 ? ` (${result.failed} falliti)` : ""}.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {status === "loading" ? "Invio in corso..." : "Invia email"}
          </button>
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
