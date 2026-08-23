import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Il motore "client" (obbligatorio per girare su Cloudflare Workers, che non
// può eseguire binari nativi) richiede sempre un driver adapter attivo: usiamo
// lo stesso adapter libSQL sia in locale (punta al file SQLite via DATABASE_URL)
// sia in produzione (punta al database remoto Turso via TURSO_DATABASE_URL),
// così nessuna delle query sparse nel resto del codice deve cambiare.
function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const adapter = tursoUrl
    ? new PrismaLibSQL({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN })
    : new PrismaLibSQL({ url: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
