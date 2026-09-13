import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,40}$/, "Usa solo lettere, numeri, - e _ (3-40 caratteri)."),
    type: z.enum(["percent", "amount"]),
    value: z.number().positive(),
    maxRedemptions: z.number().int().positive().optional(),
    expiresAt: z.string().optional(),
  })
  .refine((d) => d.type !== "percent" || d.value <= 100, { message: "La percentuale non può superare 100.", path: ["value"] });

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const promotionCodes = await getStripe().promotionCodes.list({ limit: 100, expand: ["data.coupon"] });
  return NextResponse.json({ promotionCodes: promotionCodes.data });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dati non validi." }, { status: 400 });
  }
  const { code, type, value, maxRedemptions, expiresAt } = parsed.data;

  const stripe = getStripe();
  try {
    const coupon = await stripe.coupons.create(
      type === "percent" ? { percent_off: value, duration: "once" } : { amount_off: Math.round(value * 100), currency: "eur", duration: "once" }
    );

    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      max_redemptions: maxRedemptions,
      expires_at: expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : undefined,
    });

    return NextResponse.json({ ok: true, id: promotionCode.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
