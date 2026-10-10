import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { sendNextBatch } from "@/lib/newsletter";

// Spedire un gruppo può richiedere qualche decina di secondi (con un allegato si manda una email
// per volta): si dà alla funzione il tempo massimo invece del limite predefinito.
export const maxDuration = 60;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  if (!emailConfigured()) return NextResponse.json({ error: "Invio email non configurato." }, { status: 400 });

  const { id } = await params;
  try {
    return NextResponse.json(await sendNextBatch(id));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore durante l'invio." }, { status: 500 });
  }
}
