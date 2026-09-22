import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z
  .object({
    phone: z.string().trim().min(6, "Inserisci un numero di telefono valido.").max(30).optional(),
    marketingConsent: z.boolean().optional(),
  })
  .refine((d) => d.phone !== undefined || d.marketingConsent !== undefined, { message: "Nessun dato da aggiornare." });

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Devi accedere." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }

  await prisma.account.update({
    where: { id: session.accountId },
    data: {
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
      ...(parsed.data.marketingConsent !== undefined ? { marketingConsent: parsed.data.marketingConsent } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
