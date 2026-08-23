import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendEmail, brandedEmail, emailConfigured, escapeHtml } from "@/lib/email";

const schema = z.object({
  audience: z.enum(["consenting", "members"]),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
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

  const { audience, subject, message } = parsed.data;

  const emails = new Set<string>();
  const members = await prisma.account.findMany({
    where: { role: "MEMBER", ...(audience === "consenting" ? { marketingConsent: true } : {}) },
    select: { email: true },
  });
  members.forEach((m) => emails.add(m.email));

  const html = brandedEmail({
    title: subject,
    bodyHtml: message
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 12px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
      .join(""),
  });

  const recipients = Array.from(emails);
  let sent = 0;
  let failed = 0;
  for (const to of recipients) {
    const result = await sendEmail({ to, subject, html });
    if (result.ok) sent += 1;
    else failed += 1;
  }

  return NextResponse.json({ ok: true, total: recipients.length, sent, failed });
}
