import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

// Stripe non permette di eliminare un codice promozionale: l'unica azione possibile è
// disattivarlo, così smette di funzionare in checkout ma resta nello storico di Stripe.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  try {
    await getStripe().promotionCodes.update(id, { active: false });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
