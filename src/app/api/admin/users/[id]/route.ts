import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

const schema = z
  .object({
    level: z.number().int().min(1).max(3).optional(),
    password: z.string().min(8, "La password deve avere almeno 8 caratteri.").max(200).optional(),
  })
  .refine((data) => data.level !== undefined || data.password !== undefined, {
    message: "Nessun dato da aggiornare.",
  });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const target = await prisma.account.findUnique({ where: { id } });
  if (!target || target.role !== "MEMBER") {
    return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
  }

  await prisma.account.update({
    where: { id },
    data: {
      ...(parsed.data.level !== undefined ? { level: parsed.data.level } : {}),
      ...(parsed.data.password !== undefined ? { passwordHash: await hashPassword(parsed.data.password) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const target = await prisma.account.findUnique({ where: { id } });
  if (!target || target.role !== "MEMBER") {
    return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
  }

  await prisma.account.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
