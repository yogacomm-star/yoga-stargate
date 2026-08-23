import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { googleAuthConfigured, buildGoogleAuthUrl } from "@/lib/googleAuth";

const STATE_COOKIE = "ys_google_state";

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!googleAuthConfigured()) {
    const redirectTo = url.searchParams.get("from") === "admin" ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(`${redirectTo}?error=google_not_configured`, url.origin));
  }

  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(buildGoogleAuthUrl(url.origin, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
