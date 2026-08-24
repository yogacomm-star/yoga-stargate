import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  amount: z.number().positive().max(1000000),
  description: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const sale = await prisma.manualSale.create({
    data: { amount: parsed.data.amount, description: parsed.data.description || null },
  });

  return NextResponse.json({ ok: true, id: sale.id });
}
