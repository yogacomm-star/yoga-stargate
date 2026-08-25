import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Firma mancante." }, { status: 400 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook non configurato." }, { status: 500 });

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Firma non valida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const { courseId, accountId } = checkoutSession.metadata ?? {};

    if (courseId && accountId && checkoutSession.payment_status === "paid") {
      try {
        // idempotente: stripeCheckoutSession è unique, e Stripe può reinviare lo stesso evento più volte.
        await prisma.coursePurchase.upsert({
          where: { stripeCheckoutSession: checkoutSession.id },
          create: {
            accountId,
            courseId,
            amount: (checkoutSession.amount_total ?? 0) / 100,
            stripeCheckoutSession: checkoutSession.id,
          },
          update: {},
        });
      } catch {
        // Vincolo (accountId, courseId) già soddisfatto da un'altra sessione di checkout
        // per lo stesso corso: l'account ha comunque già accesso, nulla da fare.
      }
    }
  }

  return NextResponse.json({ received: true });
}
