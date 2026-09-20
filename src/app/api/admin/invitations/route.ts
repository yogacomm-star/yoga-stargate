import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { countPendingInvites, sendInviteBatch, sendInvitePreview, greetingName } from "@/lib/invitations";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  return NextResponse.json({ pending: await countPendingInvites() });
}

const schema = z.object({ action: z.enum(["test", "send"]) });

// "test": manda un esempio dell'email all'indirizzo dell'admin che la richiede (link finto).
// "send": invia l'invito a un gruppo di contatti importati; il pannello richiama finché non ne restano.
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  if (!emailConfigured()) return NextResponse.json({ error: "Invio email non configurato." }, { status: 400 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });

  if (parsed.data.action === "test") {
    const result = await sendInvitePreview(admin.email, greetingName(admin.name));
    if (!result.ok) return NextResponse.json({ error: "Invio della prova non riuscito." }, { status: 502 });
    return NextResponse.json({ ok: true, to: admin.email });
  }

  const result = await sendInviteBatch();
  if (result.error) return NextResponse.json({ error: result.error, remaining: result.remaining }, { status: 502 });
  return NextResponse.json(result);
}
