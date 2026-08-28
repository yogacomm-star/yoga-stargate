import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createUnlockToken, lockSite, unlockSite, SITE_LOCK_COOKIE } from "@/lib/siteLock";

const schema = z.object({ action: z.enum(["lock", "unlock"]) });

export async function POST(request: Request) {
  const admin = await requireAdmin();
  // Solo il titolare del sito può bloccarlo/sbloccarlo, non un admin qualsiasi (es. Tina):
  // se lo attivasse per errore, rimarrebbe tagliata fuori pure lei senza avere il codice.
  if (!admin || !admin.isOwner) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });

  if (parsed.data.action === "unlock") {
    await unlockSite();
    const res = NextResponse.json({ locked: false });
    res.cookies.delete(SITE_LOCK_COOKIE);
    return res;
  }

  const code = await lockSite();
  const res = NextResponse.json({ locked: true, code });
  // Sblocca subito il browser di chi ha appena attivato il blocco, così non resta tagliato
  // fuori dal proprio stesso sito prima ancora di aver potuto salvare/condividere il codice.
  const token = await createUnlockToken();
  res.cookies.set(SITE_LOCK_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
