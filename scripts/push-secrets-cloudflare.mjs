#!/usr/bin/env node
// Carica su Cloudflare i secret di cui il sito ha bisogno a runtime, leggendoli da .dev.vars.
//
// Serve perché .env e .dev.vars sono file locali: il Worker pubblicato non li vede: senza
// questo passaggio il sito va online ma senza database, sessioni, pagamenti e storage.
//
// I valori vengono passati a wrangler sullo standard input, mai come argomenti da riga di
// comando (finirebbero nella lista dei processi) e non vengono mai stampati a schermo.
//
// Uso:
//   node scripts/push-secrets-cloudflare.mjs           applica i secret
//   node scripts/push-secrets-cloudflare.mjs --dry-run  mostra solo cosa farebbe
//
// Il Worker deve già esistere: al primo giro va lanciato prima `npm run deploy`.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Le variabili che il codice legge da process.env a runtime. Fuori da qui restano di
// proposito: DATABASE_URL (solo sviluppo locale), ADMIN_EMAIL/ADMIN_PASSWORD (solo per il
// seed) e le NEXT_PUBLIC_*, che Next incorpora nel bundle al momento del build e quindi
// vanno impostate nell'ambiente di build, non come secret.
const RUNTIME_SECRETS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "SESSION_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "GROQ_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_DRIVE_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_URL",
];

const dryRun = process.argv.includes("--dry-run");
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".dev.vars");

// Parser minimo in stile dotenv: righe KEY=valore, con le virgolette esterne rimosse e i
// commenti (righe che iniziano per #) ignorati.
function parseEnvFile(path) {
  const values = new Map();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    if (value) values.set(match[1], value);
  }
  return values;
}

let values;
try {
  values = parseEnvFile(envPath);
} catch {
  console.error(`Non trovo ${envPath}. Serve il file con i valori di produzione.`);
  process.exit(1);
}

const missing = RUNTIME_SECRETS.filter((key) => !values.has(key));
const present = RUNTIME_SECRETS.filter((key) => values.has(key));

if (missing.length) {
  console.log(`\nMancano in .dev.vars (verranno saltate): ${missing.join(", ")}`);
  if (missing.includes("TURSO_DATABASE_URL") || missing.includes("TURSO_AUTH_TOKEN")) {
    console.log("Senza le due variabili TURSO il sito pubblicato non ha database.");
  }
}

console.log(`\n${dryRun ? "[prova] " : ""}Carico ${present.length} secret su Cloudflare:\n`);

let failed = 0;
for (const key of present) {
  process.stdout.write(`  ${key} ... `);
  if (dryRun) {
    console.log("(prova, non inviato)");
    continue;
  }
  // Il valore arriva a wrangler solo sullo stdin.
  const result = spawnSync("npx", ["wrangler", "secret", "put", key], {
    input: values.get(key),
    encoding: "utf8",
  });
  if (result.status === 0) {
    console.log("fatto");
  } else {
    failed += 1;
    console.log("ERRORE");
    // Di wrangler si stampa solo il messaggio di errore, che non contiene il valore inviato.
    console.error(`    ${(result.stderr || "").trim().split("\n").slice(-3).join("\n    ")}`);
  }
}

if (failed) {
  console.error(`\n${failed} secret non caricati. Se l'errore dice che il Worker non esiste, lancia prima "npm run deploy".`);
  process.exit(1);
}

console.log(`\nFatto.${dryRun ? " (era una prova: non è stato inviato nulla)" : ""}`);
