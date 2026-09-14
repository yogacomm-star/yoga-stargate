import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { lockSite, unlockSite } from "@/lib/siteLock";

const schema = z.object({ action: z.enum(["lock", "unlock"]) });

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });

  if (parsed.data.action === "unlock") {
    await unlockSite();
    return NextResponse.json({ locked: false });
  }

  await lockSite();
  return NextResponse.json({ locked: true });
}
