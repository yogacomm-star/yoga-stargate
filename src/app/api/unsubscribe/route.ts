import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { rateLimit, clientIp } from "@/lib/rateLimit";

// Annulla il consenso alle email promozionali.
// - POST: pulsante nella pagina /disiscriviti e "annulla iscrizione con un clic" dei client
//   email (header List-Unsubscribe, RFC 8058). Questo è l'unico che modifica qualcosa.
// - GET: un client che non supporta il clic singolo apre l'indirizzo nel browser; qui si va alla
//   pagina con il pulsante. Un GET non cambia nulla, così un antivirus o un'anteprima che apre
//   il link non disiscrive nessuno.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL("/disiscriviti", url.origin);
  const t = url.searchParams.get("t");
  const r = url.searchParams.get("r");
  if (t) target.searchParams.set("t", t);
  if (r) target.searchParams.set("r", r);
  return NextResponse.redirect(target, 303);
}

export async function POST(request: Request) {
  // Limite largo: i clic singoli dei grandi provider arrivano da pochi indirizzi condivisi da
  // moltissime persone. Il token è firmato, quindi non si può indovinare.
  const { allowed } = rateLimit(`unsubscribe:${clientIp(request)}`, 300, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });

  const params = new URL(request.url).searchParams;
  const accountId = verifyUnsubscribeToken(params.get("t"));
  if (!accountId) return NextResponse.json({ error: "Il link non è valido." }, { status: 400 });

  await prisma.account.updateMany({ where: { id: accountId }, data: { marketingConsent: false } });

  // Se la disiscrizione parte da una newsletter, si segna in quell'invio (per le statistiche).
  // Si accetta solo se la riga appartiene davvero a questa persona.
  const recipientId = params.get("r");
  if (recipientId) {
    await prisma.emailCampaignRecipient
      .updateMany({ where: { id: recipientId, accountId, unsubscribedAt: null }, data: { unsubscribedAt: new Date() } })
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
