import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { rateLimit, clientIp } from "@/lib/rateLimit";

// Annulla il consenso alle email promozionali. Risponde a POST (pulsante nella pagina
// /disiscriviti e "annulla iscrizione con un clic" dei client email, RFC 8058); un GET non
// cambia nulla, così un antivirus o un'anteprima che apre il link non disiscrive nessuno.
export async function POST(request: Request) {
  const { allowed } = rateLimit(`unsubscribe:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });

  const token = new URL(request.url).searchParams.get("t");
  const accountId = verifyUnsubscribeToken(token);
  if (!accountId) return NextResponse.json({ error: "Il link non è valido." }, { status: 400 });

  await prisma.account.updateMany({ where: { id: accountId }, data: { marketingConsent: false } });
  return NextResponse.json({ ok: true });
}
