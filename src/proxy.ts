import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { siteLockEnabled, verifyUnlockToken, SITE_LOCK_COOKIE } from "@/lib/siteLock";

// Matcher ampio (tutto il sito) per il blocco password temporaneo, con le eccezioni minime
// necessarie: asset statici/Next interni, robots/sitemap, la pagina di sblocco stessa e la
// sua API, e il webhook Stripe (chiamato dai server di Stripe, non da un browser con cookie).
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|api/stripe/webhook|api/site-access|entrata).*)",
    },
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (await siteLockEnabled()) {
    const unlocked = await verifyUnlockToken(request.cookies.get(SITE_LOCK_COOKIE)?.value);
    if (!unlocked) {
      const url = new URL("/entrata", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
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
