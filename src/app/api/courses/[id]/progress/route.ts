import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canAccess } from "@/lib/levels";

const schema = z.object({ completed: z.boolean() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Devi accedere per salvare i tuoi progressi." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Corso non trovato." }, { status: 404 });
  }

  const account = await prisma.account.findUnique({ where: { id: session.accountId } });
  if (!account || !canAccess(course.requiredLevel, account.level)) {
    return NextResponse.json({ error: "Non hai accesso a questo corso." }, { status: 403 });
  }

  const progress = await prisma.courseProgress.upsert({
    where: { accountId_courseId: { accountId: session.accountId, courseId: id } },
    update: { completed: parsed.data.completed, completedAt: parsed.data.completed ? new Date() : null },
    create: {
      accountId: session.accountId,
      courseId: id,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, completed: progress.completed });
}
