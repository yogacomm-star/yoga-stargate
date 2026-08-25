import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Devi accedere per acquistare questo corso." }, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.status !== "PUBLISHED" || !course.price) {
    return NextResponse.json({ error: "Corso non disponibile per l'acquisto." }, { status: 404 });
  }

  const existing = await prisma.coursePurchase.findUnique({
    where: { accountId_courseId: { accountId: session.accountId, courseId: course.id } },
  });
  if (existing) return NextResponse.json({ error: "Hai già acquistato questo corso." }, { status: 409 });

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(course.price * 100),
          product_data: { name: course.title, description: course.excerpt },
        },
        quantity: 1,
      },
    ],
    metadata: { courseId: course.id, accountId: session.accountId },
    success_url: `${SITE_URL}/corsi/${course.slug}?acquisto=riuscito&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/corsi/${course.slug}?acquisto=annullato`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Impossibile avviare il pagamento." }, { status: 502 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
