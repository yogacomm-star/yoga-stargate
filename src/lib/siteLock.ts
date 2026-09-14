// Blocco dell'intero sito pubblico (tranne /admin/login) a chi non ha effettuato l'accesso
// come admin: vedi src/proxy.ts. Attivo/disattivo si gestisce dal pannello admin (vedi
// /api/admin/site-lock), non da variabili d'ambiente: lo stato vive in AppSettings.
import { prisma } from "@/lib/prisma";

// Piccola cache in memoria per non interrogare il DB a ogni richiesta: proxy.ts la chiama
// tramite /api/internal/site-lock, che gira nel processo Node.js normale (persiste tra una
// richiesta e l'altra), non nel bundle del middleware.
let cached: { locked: boolean; expiresAt: number } | null = null;
const CACHE_MS = 5000;

export async function siteLockEnabled(): Promise<boolean> {
  if (cached && cached.expiresAt > Date.now()) return cached.locked;
  const settings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  const locked = settings?.siteLocked ?? false;
  cached = { locked, expiresAt: Date.now() + CACHE_MS };
  return locked;
}

// Da chiamare subito dopo aver scritto su AppSettings, per non servire per qualche secondo
// uno stato ormai superato dalla cache in memoria.
export function invalidateSiteLockCache() {
  cached = null;
}

export async function lockSite(): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { siteLocked: true },
    create: { id: "singleton", siteLocked: true },
  });
  invalidateSiteLockCache();
}

export async function unlockSite(): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { siteLocked: false },
    create: { id: "singleton", siteLocked: false },
  });
  invalidateSiteLockCache();
}
