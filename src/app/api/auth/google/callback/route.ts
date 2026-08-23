import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, getSession } from "@/lib/session";
import { exchangeGoogleCode, fetchGoogleProfile, publicOrigin } from "@/lib/googleAuth";

const STATE_COOKIE = "ys_google_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = publicOrigin(url.origin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  // Alcuni browser richiamano due volte l'URL di callback (prefetch, doppio redirect):
  // se esiste già una sessione valida (creata dal primo tentativo riuscito), evitiamo
  // di mostrare un errore e mandiamo semplicemente la persona nella sua area.
  async function alreadyLoggedInOrFailed() {
    const session = await getSession();
    if (session) {
      return NextResponse.redirect(new URL(session.role === "ADMIN" ? "/admin" : "/account", origin));
    }
    return NextResponse.redirect(new URL("/login?error=google_failed", origin));
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return alreadyLoggedInOrFailed();
  }

  try {
    const tokens = await exchangeGoogleCode(code, url.origin);
    const profile = await fetchGoogleProfile(tokens.access_token);

    if (!profile.email) throw new Error("Email mancante nel profilo Google.");
    const email = profile.email.toLowerCase();

    let account = await prisma.account.findUnique({ where: { googleId: profile.sub } });
    if (!account) {
      account = await prisma.account.findUnique({ where: { email } });
    }

    if (account) {
      if (!account.googleId) {
        account = await prisma.account.update({ where: { id: account.id }, data: { googleId: profile.sub } });
      }
    } else {
      account = await prisma.account.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          googleId: profile.sub,
          passwordHash: null,
          role: "MEMBER",
          level: 1,
        },
      });
    }

    await setSessionCookie({ accountId: account.id, role: account.role });

    const destination = account.role === "ADMIN" ? "/admin" : account.phone ? "/account" : "/account?completeProfile=1";
    return NextResponse.redirect(new URL(destination, origin));
  } catch {
    return alreadyLoggedInOrFailed();
  }
}
