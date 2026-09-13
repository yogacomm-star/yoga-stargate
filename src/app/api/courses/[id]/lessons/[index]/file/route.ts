import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canAccess } from "@/lib/levels";
import { getPresignedAudioUrl } from "@/lib/r2";

// Stessa logica di ../stream/route.ts (audio), applicata al materiale PDF privato di una
// lezione: la sicurezza vive qui, non nel link mostrato in pagina, che quindi può restare
// pubblico senza rivelare nulla — solo chi ha davvero i requisiti riceve l'URL firmato.
type Lesson = { title: string; fileKey?: string; content: string };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; index: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Devi accedere per scaricare questo materiale." }, { status: 401 });

  const { id, index } = await params;
  const lessonIndex = Number(index);

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Corso non trovato." }, { status: 404 });
  }

  const lessons: Lesson[] = JSON.parse(course.lessons || "[]");
  const lesson = lessons[lessonIndex];
  if (!lesson?.fileKey) {
    return NextResponse.json({ error: "Materiale non disponibile." }, { status: 404 });
  }

  const account = await prisma.account.findUnique({ where: { id: session.accountId } });
  if (!account) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (course.price) {
    if (account.role !== "ADMIN") {
      const purchase = await prisma.coursePurchase.findUnique({
        where: { accountId_courseId: { accountId: account.id, courseId: course.id } },
      });
      if (!purchase) {
        return NextResponse.json({ error: "Questo corso richiede l'acquisto per accedere al materiale." }, { status: 403 });
      }
    }
  } else if (!canAccess(course.requiredLevel, account.level)) {
    return NextResponse.json({ error: "Non hai accesso a questo corso." }, { status: 403 });
  }

  const url = await getPresignedAudioUrl(lesson.fileKey);
  return NextResponse.redirect(url);
}
