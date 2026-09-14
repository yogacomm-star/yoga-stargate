import { NextResponse } from "next/server";
import { siteLockEnabled } from "@/lib/siteLock";

// Rotta interna, chiamata SOLO da proxy.ts. Esiste perché il bundle del middleware non
// riesce a caricare il driver del database: il controllo del blocco-sito, che ha bisogno
// del database, viene fatto qui — nel bundle "normale" delle route — e proxy.ts si limita a
// interrogare questo endpoint invece di leggere Prisma direttamente.
export async function GET() {
  return NextResponse.json({ locked: await siteLockEnabled() });
}
