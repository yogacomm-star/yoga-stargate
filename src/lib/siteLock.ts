// Blocco dell'intero sito (incluso /admin) dietro un codice generato casualmente dal
// titolare del sito. Attivo/disattivo e codice si gestiscono dal pannello admin (vedi
// /api/admin/site-lock), non da variabili d'ambiente: lo stato vive in AppSettings.
import { prisma } from "@/lib/prisma";

const encoder = new TextEncoder();

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Buffer.from(digest).toString("hex");
}

type LockState = { locked: boolean; codeHash: string | null };

// Piccola cache in memoria per non interrogare il DB a ogni richiesta: proxy.ts gira sul
// runtime Node.js (non edge), quindi il processo persiste tra una richiesta e l'altra.
let cached: { state: LockState; expiresAt: number } | null = null;
const CACHE_MS = 5000;

async function getLockState(): Promise<LockState> {
  if (cached && cached.expiresAt > Date.now()) return cached.state;
  const settings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  const state: LockState = { locked: settings?.siteLocked ?? false, codeHash: settings?.siteLockCodeHash ?? null };
  cached = { state, expiresAt: Date.now() + CACHE_MS };
  return state;
}

// Da chiamare subito dopo aver scritto su AppSettings, per non servire per qualche secondo
// uno stato di blocco ormai superato dalla cache in memoria.
export function invalidateSiteLockCache() {
  cached = null;
}

export async function siteLockEnabled(): Promise<boolean> {
  const { locked, codeHash } = await getLockState();
  return locked && codeHash !== null;
}

export { SITE_LOCK_COOKIE } from "@/lib/siteLockCookie";

function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

// Il token è firmato usando l'hash del codice corrente come chiave: appena si genera un nuovo
// codice (o si rimuove il blocco) tutti i cookie di sblocco già emessi smettono automaticamente
// di essere validi, senza dover tracciare o revocare nulla esplicitamente.
export async function createUnlockToken(): Promise<string | null> {
  const { codeHash } = await getLockState();
  if (!codeHash) return null;
  const key = await getKey(codeHash);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("unlocked"));
  return Buffer.from(signature).toString("base64url");
}

export async function verifyUnlockToken(token: string | undefined | null): Promise<boolean> {
  const { codeHash } = await getLockState();
  if (!codeHash || !token) return false;
  try {
    const key = await getKey(codeHash);
    return await crypto.subtle.verify("HMAC", key, Buffer.from(token, "base64url"), encoder.encode("unlocked"));
  } catch {
    return false;
  }
}

// Confronto a tempo costante fra due hash esadecimali di uguale lunghezza (SHA-256 → sempre
// 64 caratteri): evita che il tempo di risposta riveli quanti caratteri del codice sono corretti.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkCode(candidate: string): Promise<boolean> {
  const { codeHash } = await getLockState();
  if (!codeHash) return false;
  const candidateHash = await sha256Hex(candidate.trim().toUpperCase());
  return timingSafeEqualHex(candidateHash, codeHash);
}

// Caratteri leggibili senza ambiguità (niente 0/O, 1/I/L) per un codice facile da dettare o
// ricopiare a mano.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

// Genera un nuovo codice, attiva il blocco e lo salva (come hash) in AppSettings. Ritorna il
// codice in chiaro: è l'unica volta in cui è disponibile, va comunicato subito al titolare.
export async function lockSite(): Promise<string> {
  const code = generateCode();
  const codeHash = await sha256Hex(code);
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { siteLocked: true, siteLockCodeHash: codeHash },
    create: { id: "singleton", siteLocked: true, siteLockCodeHash: codeHash },
  });
  invalidateSiteLockCache();
  return code;
}

export async function unlockSite(): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { siteLocked: false, siteLockCodeHash: null },
    create: { id: "singleton", siteLocked: false, siteLockCodeHash: null },
  });
  invalidateSiteLockCache();
}
