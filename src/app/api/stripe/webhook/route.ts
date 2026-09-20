import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail, sendEventBookingEmails } from "@/lib/email";

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
    const { courseId, accountId, retreatId } = checkoutSession.metadata ?? {};

    // Prenotazione di un evento: la registriamo come messaggio (così compare in Admin →
    // Messaggi con nome, email e telefono) e avvisiamo chi ha prenotato e gli admin.
    if (retreatId && checkoutSession.payment_status === "paid") {
      try {
        const alreadyRecorded = await prisma.contactLead.findFirst({
          where: { source: "Prenotazione evento", message: { contains: checkoutSession.id } },
        });
        const retreat = await prisma.retreat.findUnique({ where: { id: retreatId } });
        const email = checkoutSession.customer_details?.email ?? checkoutSession.customer_email;
        if (!alreadyRecorded && retreat && email) {
          const name = checkoutSession.customer_details?.name?.trim() || "Cliente";
          const phone = checkoutSession.customer_details?.phone ?? null;
          const amount = (checkoutSession.amount_total ?? 0) / 100;
          await prisma.contactLead.create({
            data: {
              name,
              email,
              phone,
              message: `Prenotazione pagata online: ${retreat.title} — €${amount} (pagamento ${checkoutSession.id})`,
              retreatId: retreat.id,
              source: "Prenotazione evento",
            },
          });
          await sendEventBookingEmails({
            email,
            name,
            phone,
            eventTitle: retreat.title,
            eventSlug: retreat.slug,
            amount,
          });
        }
      } catch {
        // Un problema nel registrare la prenotazione non deve far rifare il webhook a Stripe
        // all'infinito: il pagamento è comunque visibile nella dashboard Stripe.
      }
    }

    if (courseId && accountId && checkoutSession.payment_status === "paid") {
      try {
        // Controllo esplicito prima dell'upsert (invece di fidarsi del solo esito): serve a
        // sapere se questa è la primissima registrazione dell'acquisto, per mandare l'email
        // di conferma una volta sola anche se Stripe reinvia più volte lo stesso evento o se
        // la pagina di ritorno del checkout ha già verificato la sessione per primo.
        const alreadyRecorded = await prisma.coursePurchase.findUnique({
          where: { stripeCheckoutSession: checkoutSession.id },
        });

        const amount = (checkoutSession.amount_total ?? 0) / 100;
        await prisma.coursePurchase.upsert({
          where: { stripeCheckoutSession: checkoutSession.id },
          create: { accountId, courseId, amount, stripeCheckoutSession: checkoutSession.id },
          update: {},
        });

        if (!alreadyRecorded) {
          const [account, course] = await Promise.all([
            prisma.account.findUnique({ where: { id: accountId } }),
            prisma.course.findUnique({ where: { id: courseId } }),
          ]);
          if (account && course) {
            await sendPurchaseConfirmationEmail({
              email: account.email,
              courseTitle: course.title,
              courseSlug: course.slug,
              amount,
            });
          }
        }
      } catch {
        // Vincolo (accountId, courseId) già soddisfatto da un'altra sessione di checkout
        // per lo stesso corso: l'account ha comunque già accesso, nulla da fare.
      }
    }
  }

  return NextResponse.json({ received: true });
}
