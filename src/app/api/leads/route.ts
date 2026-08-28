import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { LEAD_SOURCES } from "@/lib/leadSources";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
  retreatId: z.string().trim().max(60).optional().or(z.literal("")),
  groupSize: z.number().int().min(2).max(500).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
});

export async function POST(request: Request) {
  const { allowed } = rateLimit(`leads:${clientIp(request)}`, 10, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi." }, { status: 400 });
  }

  const { name, email, phone, message, retreatId, groupSize, source } = parsed.data;

  await prisma.contactLead.create({
    data: {
      name,
      email,
      phone: phone || null,
      message,
      retreatId: retreatId || null,
      groupSize: groupSize ?? null,
      source: source ?? "Contatti generali",
    },
  });

  return NextResponse.json({ ok: true });
}
