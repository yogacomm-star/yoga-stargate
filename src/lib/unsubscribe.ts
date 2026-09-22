import crypto from "node:crypto";
import { SITE_URL } from "@/lib/site";

// Link di disiscrizione presente in ogni email promozionale. Non richiede di essere collegati:
// il token è la firma (HMAC) dell'id dell'account, quindi non si può indovinare né falsificare
// per un'altra persona. Non ha scadenza: chi riceve una vecchia email deve poter sempre
// annullare l'iscrizione.
function secret(): string {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET non configurato.");
  }
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function sign(accountId: string): string {
  return crypto.createHmac("sha256", secret()).update(`unsubscribe:${accountId}`).digest("base64url");
}

export function unsubscribeToken(accountId: string): string {
  return `${Buffer.from(accountId).toString("base64url")}.${sign(accountId)}`;
}

/** Restituisce l'id dell'account se il token è autentico, altrimenti null. */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const [idPart, sig] = token.split(".");
  if (!idPart || !sig) return null;
  let accountId: string;
  try {
    accountId = Buffer.from(idPart, "base64url").toString();
  } catch {
    return null;
  }
  const expected = Buffer.from(sign(accountId));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  return accountId;
}

export function unsubscribeUrl(accountId: string): string {
  return `${SITE_URL}/disiscriviti?t=${unsubscribeToken(accountId)}`;
}
