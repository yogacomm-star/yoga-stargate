import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6, "Inserisci un numero di telefono valido.").max(30),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri.").max(200),
});

export async function POST(request: Request) {
  const { allowed } = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Troppi tentativi. Riprova più tardi." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Esiste già un account con questa email." }, { status: 409 });
  }

  const account = await prisma.account.create({
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      passwordHash: await hashPassword(parsed.data.password),
      role: "MEMBER",
      level: 1,
    },
  });

  await setSessionCookie({ accountId: account.id, role: account.role });

  return NextResponse.json({ ok: true, role: account.role });
}
