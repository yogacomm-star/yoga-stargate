#!/usr/bin/env node
// Applica gli schema change più recenti al database di produzione Turso prima del build.
// `prisma migrate deploy` NON funziona con Turso: il motore di migrazione "classic" di Prisma
// richiede uno sqlite locale (url che inizia con "file:") e rifiuta gli URL libsql:// di Turso,
// anche se a runtime l'app si connette benissimo via l'adapter libSQL (src/lib/prisma.ts). Qui
// usiamo direttamente @libsql/client — la stessa libreria già usata a runtime — per applicare
// l'SQL di ogni migration generata in locale.
//
// Ogni blocco è idempotente (controlla prima se la colonna in questione esiste già): sicuro da
// rilanciare a ogni deploy anche dopo che le migration sono già state applicate. Quando si
// aggiunge una nuova migration che deve arrivare anche in produzione, si aggiunge qui un nuovo
// blocco sullo stesso modello (non c'è una tabella di tracking delle migration applicate).
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.log("[migrate-production] TURSO_DATABASE_URL/TURSO_AUTH_TOKEN non impostate: salto (build locale?).");
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "prisma/migrations");

const client = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

async function applyIfColumnMissing(table, column, migrationDirName) {
  const columns = await client.execute(`PRAGMA table_info("${table}")`);
  const alreadyApplied = columns.rows.some((r) => r.name === column);
  if (alreadyApplied) {
    console.log(`[migrate-production] Colonna "${column}" già presente su ${table}: nulla da fare.`);
    return;
  }
  console.log(`[migrate-production] Applico ${migrationDirName}...`);
  const sql = readFileSync(join(migrationsDir, migrationDirName, "migration.sql"), "utf8");
  await client.executeMultiple(sql);
  console.log(`[migrate-production] Migration ${migrationDirName} applicata con successo.`);
}

try {
  await applyIfColumnMissing("ContactLead", "source", "20260827131546_add_lead_source_and_stripe_session");
  await applyIfColumnMissing("Account", "isOwner", "20260828211745_add_site_lock_and_owner");
} finally {
  client.close();
}
