import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requeueFailed } from "@/lib/newsletter";

// Rimette "in attesa" chi non è stato raggiunto, così il pulsante di invio li riprova.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  return NextResponse.json({ ok: true, requeued: await requeueFailed(id) });
}
