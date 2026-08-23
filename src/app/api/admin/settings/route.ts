import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/storage";

const schema = z.object({ storageLimitEnabled: z.boolean() });

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  await getAppSettings(); // assicura che la riga esista
  await prisma.appSettings.update({
    where: { id: "singleton" },
    data: { storageLimitEnabled: parsed.data.storageLimitEnabled },
  });

  return NextResponse.json({ ok: true });
}
