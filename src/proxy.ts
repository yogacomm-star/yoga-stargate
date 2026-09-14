import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

// Matcher ampio (tutto il sito) per il blocco-sito e la protezione di /admin, con le
// eccezioni minime necessarie: asset statici/Next interni, robots/sitemap, la pagina "in
// costruzione" stessa, l'endpoint interno usato per controllare il blocco-sito (altrimenti
// si richiamerebbe all'infinito), e il webhook Stripe (chiamato dai server di Stripe, non
// da un browser con cookie).
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|icon-512.png|manifest.webmanifest|robots.txt|sitemap.xml|api/stripe/webhook|api/internal/site-lock|entrata).*)",
    },
  ],
};

// Il controllo del blocco-sito passa da una fetch interna invece che da Prisma direttamente
// qui dentro: il bundle del middleware non riesce a caricare il driver del database. Vedi
// src/app/api/internal/site-lock/route.ts. Quella fetch è un giro di rete in più su OGNI
// richiesta, quindi l'esito viene tenuto in cache per qualche secondo nell'isolate corrente
// (stessa durata della cache lato server in src/lib/siteLock.ts): dopo aver attivato o tolto
// il blocco dal pannello admin, il sito si allinea da solo entro la scadenza.
const LOCK_CACHE_MS = 5000;
let lockCache: { locked: boolean; expiresAt: number } | null = null;

async function isSiteLocked(request: NextRequest): Promise<boolean> {
  if (lockCache && lockCache.expiresAt > Date.now()) return lockCache.locked;

  try {
    const res = await fetch(new URL("/api/internal/site-lock", request.url));
    if (!res.ok) return false; // errore nel controllo: non blocchiamo il sito per un problema nostro
    const data = (await res.json()) as { locked: boolean };
    lockCache = { locked: data.locked, expiresAt: Date.now() + LOCK_CACHE_MS };
    return data.locked;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isAdmin = session?.role === "ADMIN";

  // Blocco-sito: nasconde tutto il sito pubblico (home, ritiri, corsi, account, login...)
  // dietro la pagina "in costruzione" a chiunque non abbia effettuato l'accesso admin.
  // /admin/login e /api/auth/login (la form di login invia qui) restano sempre
  // raggiungibili — altrimenti l'admin stessa non potrebbe più autenticarsi per sbloccarlo.
  // Un rewrite (non un redirect) mantiene l'URL originale nella barra degli indirizzi: un
  // link condiviso mostra la pagina "in costruzione" alla stessa posizione, invece di
  // rimbalzare altrove in modo confuso.
  const bypassesLock = pathname === "/admin/login" || pathname === "/api/auth/login";
  if (!isAdmin && !bypassesLock && (await isSiteLocked(request))) {
    return NextResponse.rewrite(new URL("/entrata", request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }
    if (!isAdmin) {
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
