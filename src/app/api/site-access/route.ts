import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { checkCode, createUnlockToken, siteLockEnabled, SITE_LOCK_COOKIE } from "@/lib/siteLock";

const schema = z.object({ code: z.string().min(1).max(200) });

export async function POST(request: Request) {
  if (!(await siteLockEnabled())) return NextResponse.json({ error: "Nessun blocco attivo." }, { status: 400 });

  const { allowed } = rateLimit(`site-access:${clientIp(request)}`, 10, 15 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppi tentativi. Riprova più tardi." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Codice mancante." }, { status: 400 });

  if (!(await checkCode(parsed.data.code))) {
    return NextResponse.json({ error: "Codice errato." }, { status: 401 });
  }

  const token = await createUnlockToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SITE_LOCK_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 giorni
  });
  return res;
}
