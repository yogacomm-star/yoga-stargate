import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

const reorderSchema = z.object({ direction: z.enum(["up", "down"]) });

// Scambia la posizione dell'elemento con quello immediatamente sopra o sotto in ordine di
// visualizzazione. Niente drag&drop: due frecce coprono lo stesso bisogno con molto meno
// codice, e vanno bene anche da cellulare.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const items = await prisma.galleryItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return NextResponse.json({ error: "Elemento non trovato." }, { status: 404 });

  const neighborIndex = parsed.data.direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= items.length) {
    return NextResponse.json({ ok: true }); // già al bordo: nessuno scambio da fare
  }

  const current = items[index];
  const neighbor = items[neighborIndex];
  await prisma.$transaction([
    prisma.galleryItem.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    prisma.galleryItem.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ ok: true });

  await prisma.galleryItem.delete({ where: { id } });
  if (item.imageKey) await deleteFromR2(item.imageKey);

  return NextResponse.json({ ok: true });
}
