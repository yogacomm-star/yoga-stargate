import { prisma } from "@/lib/prisma";

export const OCCASIONAL_WORK_LIMIT = 5000; // soglia annuale prestazioni occasionali

// Somma delle vendite (manuali + acquisti corsi via Stripe) dall'inizio dell'anno solare
// corrente: il conteggio "si azzera" semplicemente perché filtra sempre dal 1° gennaio in corso.
export async function getYearToDateRevenue(): Promise<{ total: number; year: number }> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);

  const [manual, purchases] = await Promise.all([
    prisma.manualSale.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfYear } } }),
    prisma.coursePurchase.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfYear } } }),
  ]);

  return { total: (manual._sum.amount ?? 0) + (purchases._sum.amount ?? 0), year };
}

// Somma di tutte le vendite (manuali + acquisti corsi via Stripe), senza limiti di data.
export async function getAllTimeRevenue(): Promise<number> {
  const [manual, purchases] = await Promise.all([
    prisma.manualSale.aggregate({ _sum: { amount: true } }),
    prisma.coursePurchase.aggregate({ _sum: { amount: true } }),
  ]);
  return (manual._sum.amount ?? 0) + (purchases._sum.amount ?? 0);
}
