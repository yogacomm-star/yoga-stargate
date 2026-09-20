import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, brandedEmail, emailConfigured, escapeHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().trim().email() });

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 ora
const OK = { ok: true };

// "Password dimenticata": chi ha perso l'email di invito (o il link è scaduto) si fa mandare un
// nuovo link. La risposta è sempre la stessa, che l'indirizzo esista o no: altrimenti la
// pagina permetterebbe di scoprire quali email sono registrate. Gli admin sono esclusi: la loro
// password si cambia solo da chi ha già accesso.
export async function POST(request: Request) {
  const { allowed } = rateLimit(`forgot-password:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Inserisci un indirizzo email valido." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const { allowed: emailAllowed } = rateLimit(`forgot-password-email:${email}`, 3, 60 * 60 * 1000);
  if (!emailAllowed || !emailConfigured()) return NextResponse.json(OK);

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account || account.role !== "MEMBER") return NextResponse.json(OK);

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { token, accountId: account.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const html = brandedEmail({
    title: "Scegli una nuova password",
    bodyHtml: `<p style="margin:0 0 12px;">Ciao ${escapeHtml(account.name)},</p><p style="margin:0 0 12px;">Hai chiesto di reimpostare la password del tuo account Yoga Stargate. Il link scade tra un'ora.</p><p style="margin:0;">Se non sei stata/o tu, puoi ignorare questa email: la tua password non cambia.</p>`,
    ctaLabel: "Scegli la password",
    ctaUrl: `${SITE_URL}/reimposta-password?token=${token}`,
  });
  await sendEmail({ to: account.email, subject: "Reimposta la tua password — Yoga Stargate", html });

  return NextResponse.json(OK);
}
