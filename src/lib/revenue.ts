import { prisma } from "@/lib/prisma";

export const OCCASIONAL_WORK_LIMIT = 5000; // soglia annuale prestazioni occasionali

// Somma delle vendite registrate manualmente dall'inizio dell'anno solare corrente:
// il conteggio "si azzera" semplicemente perché filtra sempre dal 1° gennaio in corso.
export async function getYearToDateRevenue(): Promise<{ total: number; year: number }> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);

  const result = await prisma.manualSale.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: startOfYear } },
  });

  return { total: result._sum.amount ?? 0, year };
}

// Somma di tutte le vendite registrate manualmente, senza limiti di data.
export async function getAllTimeRevenue(): Promise<number> {
  const result = await prisma.manualSale.aggregate({ _sum: { amount: true } });
  return result._sum.amount ?? 0;
}
