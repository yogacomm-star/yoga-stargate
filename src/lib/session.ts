import { cookies } from "next/headers";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET non configurato: impostalo nelle variabili d'ambiente prima di avviare in produzione."
  );
}

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
export const SESSION_COOKIE = "ys_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 giorni

export type SessionPayload = {
  accountId: string;
  role: "ADMIN" | "MEMBER";
  exp: number;
};

// Firma HMAC via Web Crypto (Buffer/crypto Node.js non sono garantiti nel runtime edge
// del middleware): funziona in modo identico su Node, edge e Cloudflare Workers.
const encoder = new TextEncoder();

function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionToken(payload: Pick<SessionPayload, "accountId" | "role">): Promise<string> {
  const full: SessionPayload = { ...payload, exp: Date.now() + MAX_AGE_SECONDS * 1000 };
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${Buffer.from(signature).toString("base64url")}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const key = await getKey();
  const valid = await crypto.subtle.verify("HMAC", key, Buffer.from(sig, "base64url"), encoder.encode(data));
  if (!valid) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Pick<SessionPayload, "accountId" | "role">) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
