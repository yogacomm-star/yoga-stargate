import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  targetType: z.enum(["RETREAT", "COURSE"]),
  targetId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Devi accedere per salvare i preferiti." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const { targetType, targetId } = parsed.data;
  const existing = await prisma.favorite.findUnique({
    where: { accountId_targetType_targetId: { accountId: session.accountId, targetType, targetId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, favorited: false });
  }

  await prisma.favorite.create({ data: { accountId: session.accountId, targetType, targetId } });
  return NextResponse.json({ ok: true, favorited: true });
}
