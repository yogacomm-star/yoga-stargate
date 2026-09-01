import { NextResponse } from "next/server";
import { siteLockEnabled, verifyUnlockToken, SITE_LOCK_COOKIE } from "@/lib/siteLock";

// Rotta interna, chiamata SOLO da proxy.ts (via WORKER_SELF_REFERENCE), mai dal browser.
// Esiste perché su Cloudflare Workers il bundle del middleware non riesce a caricare il
// driver del database (richiede un binario nativo non disponibile in quel sandbox): il
// controllo del blocco-sito, che ha bisogno del database, viene quindi fatto qui — nel
// bundle "normale" delle route, dove il client libSQL via HTTP funziona correttamente —
// e proxy.ts si limita a interrogare questo endpoint invece di leggere Prisma direttamente.
export async function GET(request: Request) {
  const locked = await siteLockEnabled();
  if (!locked) return NextResponse.json({ locked: false, unlocked: true });

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${SITE_LOCK_COOKIE}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1]) : null;
  const unlocked = await verifyUnlockToken(token);

  return NextResponse.json({ locked: true, unlocked });
}
