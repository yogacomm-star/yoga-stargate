import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendEmail, brandedEmail, emailConfigured, messageToHtml, unsubscribeHeaders } from "@/lib/email";
import { unsubscribeUrl } from "@/lib/unsubscribe";

const buttonSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z.string().trim().url().max(500),
});

const schema = z.object({
  audience: z.enum(["consenting", "members"]),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  buttons: z.array(buttonSchema).max(2).optional(),
  attachmentUrl: z.string().trim().url().max(1000).optional(),
  attachmentName: z.string().trim().max(150).optional(),
  // Invia solo all'admin che ha premuto il pulsante, per vedere l'email prima di spedirla a
  // tutti: stesso contenuto (testo, pulsanti, allegato) della vera newsletter, non un modello fisso.
  test: z.boolean().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "L'invio email non è ancora configurato. Aggiungi RESEND_API_KEY nelle variabili d'ambiente." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const { audience, subject, message, buttons, attachmentUrl, attachmentName, test } = parsed.data;
  const bodyHtml = messageToHtml(message);
  const attachment = attachmentUrl ? { filename: attachmentName || "allegato.pdf", path: attachmentUrl } : undefined;

  if (test) {
    const unsub = unsubscribeUrl(admin.id);
    const html = brandedEmail({ title: subject, bodyHtml, buttons, unsubscribeUrl: unsub });
    const result = await sendEmail({
      to: admin.email,
      subject: `[PROVA] ${subject}`,
      html,
      headers: unsubscribeHeaders(unsub),
      attachment,
    });
    if (!result.ok) return NextResponse.json({ error: "Invio della prova non riuscito." }, { status: 502 });
    return NextResponse.json({ ok: true, test: true, to: admin.email });
  }

  const recipients = await prisma.account.findMany({
    where: { role: "MEMBER", ...(audience === "consenting" ? { marketingConsent: true } : {}) },
    select: { id: true, email: true },
  });

  let sent = 0;
  let failed = 0;
  for (const { id, email: to } of recipients) {
    // Ogni destinatario riceve la sua copia con il suo link personale per annullare l'iscrizione.
    const unsub = unsubscribeUrl(id);
    const html = brandedEmail({ title: subject, bodyHtml, buttons, unsubscribeUrl: unsub });
    const result = await sendEmail({ to, subject, html, headers: unsubscribeHeaders(unsub), attachment });
    if (result.ok) sent += 1;
    else failed += 1;
  }

  return NextResponse.json({ ok: true, total: recipients.length, sent, failed });
}
