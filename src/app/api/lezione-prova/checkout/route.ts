import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const TRIAL_PRICE_EUR = 20;

const slotOptions = [
  { label: "Lezione del mattino — Mercoledì 9:00", value: "mattino" },
  { label: "Yoga per teenager — Mercoledì 17:00", value: "teenager" },
  { label: "Livello adulti — Mercoledì 18:15", value: "adulti" },
  { label: "Livello avanzato — Mercoledì 19:45", value: "avanzato" },
];

export async function POST(request: Request) {
  // Nessuna autenticazione richiesta per prenotare una prova: limitiamo comunque per IP
  // per evitare che uno script crei un numero illimitato di sessioni Stripe.
  const { allowed } = rateLimit(`lezione-prova:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Troppe richieste. Riprova più tardi." }, { status: 429 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: TRIAL_PRICE_EUR * 100,
            product_data: {
              name: "Lezione di prova — Percorsi Live a Milano",
              description:
                "Una lezione di prova dei Percorsi Live di Yoga Stargate in Via Zanella 56, Milano. Ti ricontatteremo per confermare la data.",
            },
          },
          quantity: 1,
        },
      ],
      custom_fields: [
        {
          key: "lezione",
          label: { type: "custom", custom: "Quale lezione vuoi provare?" },
          type: "dropdown",
          dropdown: { options: slotOptions },
        },
      ],
      metadata: { type: "trial-lesson" },
      success_url: `${SITE_URL}/my-yoga?prenotazione=riuscita`,
      cancel_url: `${SITE_URL}/my-yoga?prenotazione=annullata`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Impossibile avviare il pagamento." }, { status: 502 });
    }
    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json(
      { error: "Impossibile avviare il pagamento in questo momento. Riprova oppure scrivici dai contatti." },
      { status: 502 },
    );
  }
}
