import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { SITE_LOCK_COOKIE } from "@/lib/siteLockCookie";

// Matcher ampio (tutto il sito) per il blocco-sito e la protezione di /admin, con le
// eccezioni minime necessarie: asset statici/Next interni, robots/sitemap, la pagina di
// sblocco stessa e la sua API, l'endpoint interno usato per controllare il blocco-sito
// (altrimenti si richiamerebbe all'infinito), e il webhook Stripe (chiamato dai server di
// Stripe, non da un browser con cookie).
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|icon-512.png|manifest.webmanifest|robots.txt|sitemap.xml|api/stripe/webhook|api/site-access|api/internal/site-lock|entrata).*)",
    },
  ],
};

// Il controllo del blocco-sito passa da una fetch interna invece che da Prisma direttamente
// qui dentro: su Cloudflare Workers il bundle del middleware (a differenza di quello delle
// route normali) non riesce a caricare il driver del database. Vedi
// src/app/api/internal/site-lock/route.ts.
//
// Quella fetch è però un giro di rete in più su OGNI richiesta al sito, quindi l'esito viene
// tenuto in cache per qualche secondo nell'isolate corrente (stessa durata della cache lato
// server in src/lib/siteLock.ts). L'esito dipende dal cookie di sblocco — e solo da quello,
// non dalla sessione — quindi la cache è indicizzata sul suo valore. Qualche secondo di
// ritardo è accettabile: dopo aver attivato o tolto il blocco dal pannello admin, il sito si
// allinea da solo entro la scadenza.
const LOCK_CACHE_MS = 5000;
// Tetto di sicurezza: senza, un client che manda cookie di sblocco casuali potrebbe far
// crescere la mappa senza limite. Superata la soglia si riparte da zero (la cache è solo
// un'ottimizzazione: perderla costa una fetch in più, non cambia il comportamento).
const LOCK_CACHE_MAX_ENTRIES = 500;
const lockCache = new Map<string, { unlocked: boolean; expiresAt: number }>();

async function isUnlocked(request: NextRequest): Promise<boolean> {
  const unlockToken = request.cookies.get(SITE_LOCK_COOKIE)?.value ?? "";

  const cached = lockCache.get(unlockToken);
  if (cached && cached.expiresAt > Date.now()) return cached.unlocked;

  try {
    const res = await fetch(new URL("/api/internal/site-lock", request.url), {
      // Si inoltra solo il cookie di sblocco: è l'unico che l'endpoint legge, e così la
      // chiave della cache qui sopra corrisponde esattamente a ciò che determina l'esito.
      headers: { cookie: `${SITE_LOCK_COOKIE}=${encodeURIComponent(unlockToken)}` },
    });
    if (!res.ok) return true; // errore nel controllo: non blocchiamo il sito per un problema nostro
    const data = (await res.json()) as { locked: boolean; unlocked: boolean };
    const unlocked = !data.locked || data.unlocked;

    if (lockCache.size >= LOCK_CACHE_MAX_ENTRIES) lockCache.clear();
    lockCache.set(unlockToken, { unlocked, expiresAt: Date.now() + LOCK_CACHE_MS });

    return unlocked;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!(await isUnlocked(request))) {
    const url = new URL("/entrata", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (session?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    if (!session || session.role !== "ADMIN") {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/account")) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
