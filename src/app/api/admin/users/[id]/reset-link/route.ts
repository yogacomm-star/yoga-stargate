import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendEmail, brandedEmail, emailConfigured, escapeHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 ora

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { allowed } = rateLimit(`reset-link:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste, riprova più tardi." }, { status: 429 });

  if (!emailConfigured()) {
    return NextResponse.json({ error: "Invio email non configurato." }, { status: 400 });
  }

  const { id } = await params;
  const target = await prisma.account.findUnique({ where: { id } });
  if (!target || target.role !== "MEMBER") {
    return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { token, accountId: target.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const resetUrl = `${SITE_URL}/reimposta-password?token=${token}`;
  const html = brandedEmail({
    title: "Reimposta la tua password",
    bodyHtml: `<p style="margin:0 0 12px;">Ciao ${escapeHtml(target.name)},</p><p style="margin:0 0 12px;">Abbiamo generato un link per reimpostare la password del tuo account Yoga Stargate. Il link scade tra un'ora.</p>`,
    ctaLabel: "Reimposta password",
    ctaUrl: resetUrl,
  });

  const result = await sendEmail({ to: target.email, subject: "Reimposta la tua password — Yoga Stargate", html });
  if (!result.ok) {
    return NextResponse.json({ error: "Invio email non riuscito." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
