import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { rateLimit, clientIp } from "@/lib/rateLimit";

// Prenotazione con pagamento di un evento (masterclass, workshop, ritiro, viaggio). A differenza
// dei corsi non serve un account: chiunque può prenotare, Stripe raccoglie nome, email e
// telefono. Se ha effettuato l'accesso, l'email viene precompilata.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = rateLimit(`event-checkout:${clientIp(request)}`, 15, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });

  const { id } = await params;
  const retreat = await prisma.retreat.findUnique({ where: { id } });
  if (!retreat || retreat.status !== "PUBLISHED" || !retreat.price || retreat.price <= 0) {
    return NextResponse.json({ error: "Evento non disponibile per la prenotazione." }, { status: 404 });
  }

  const last = retreat.endDate ?? retreat.startDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (last && last < today) {
    return NextResponse.json({ error: "Questo evento è già concluso." }, { status: 410 });
  }

  const session = await getSession();
  const account = session ? await prisma.account.findUnique({ where: { id: session.accountId } }) : null;

  let url: string | null = null;
  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      phone_number_collection: { enabled: true },
      ...(account?.email ? { customer_email: account.email } : {}),
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(retreat.price * 100),
            product_data: { name: retreat.title, description: retreat.excerpt.slice(0, 500) },
          },
          quantity: 1,
        },
      ],
      metadata: { retreatId: retreat.id, ...(account ? { accountId: account.id } : {}) },
      success_url: `${SITE_URL}/eventi/${retreat.slug}?prenotazione=riuscita`,
      cancel_url: `${SITE_URL}/eventi/${retreat.slug}?prenotazione=annullata`,
    });
    url = checkoutSession.url;
  } catch {
    return NextResponse.json(
      { error: "Il pagamento online non è al momento disponibile. Scrivici dal modulo qui sotto." },
      { status: 503 }
    );
  }

  if (!url) return NextResponse.json({ error: "Impossibile avviare il pagamento." }, { status: 502 });
  return NextResponse.json({ url });
}
