import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

const GENERIC_ERROR = "Email o password non corretti.";
const RATE_LIMIT_ERROR = "Troppi tentativi di accesso. Riprova tra qualche minuto.";

export async function POST(request: Request) {
  const { allowed } = rateLimit(`login:${clientIp(request)}`, 8, 5 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!account || !account.passwordHash) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, account.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await setSessionCookie({ accountId: account.id, role: account.role });

  return NextResponse.json({ ok: true, role: account.role });
}
