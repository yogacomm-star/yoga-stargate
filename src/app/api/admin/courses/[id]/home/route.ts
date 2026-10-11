import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({ showOnHome: z.boolean() });

// Sceglie se un corso partecipa alla rotazione in home page. Un'azione a sé (non il modulo di
// modifica del corso): così si può cambiare dall'elenco senza aprire ogni corso e senza rischiare
// di toccare altro.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });

  const { id } = await params;
  const result = await prisma.course.updateMany({ where: { id }, data: { showOnHome: parsed.data.showOnHome } });
  if (result.count === 0) return NextResponse.json({ error: "Corso non trovato." }, { status: 404 });

  return NextResponse.json({ ok: true, showOnHome: parsed.data.showOnHome });
}
