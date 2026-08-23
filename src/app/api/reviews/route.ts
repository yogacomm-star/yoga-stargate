import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canAccess } from "@/lib/levels";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  targetType: z.enum(["RETREAT", "COURSE"]),
  targetId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
});

export async function POST(request: Request) {
  const { allowed } = rateLimit(`reviews:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Devi accedere per lasciare una recensione." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const { targetType, targetId, rating, comment } = parsed.data;
  const account = await prisma.account.findUnique({ where: { id: session.accountId } });
  if (!account) return NextResponse.json({ error: "Account non trovato." }, { status: 404 });

  const target =
    targetType === "RETREAT"
      ? await prisma.retreat.findUnique({ where: { id: targetId } })
      : await prisma.course.findUnique({ where: { id: targetId } });

  if (!target || target.status !== "PUBLISHED" || !canAccess(target.requiredLevel, account.level)) {
    return NextResponse.json({ error: "Non hai accesso a questo contenuto." }, { status: 403 });
  }

  const review = await prisma.review.create({
    data: { accountId: account.id, targetType, targetId, rating, comment, status: "PENDING" },
  });

  return NextResponse.json({ ok: true, id: review.id });
}
