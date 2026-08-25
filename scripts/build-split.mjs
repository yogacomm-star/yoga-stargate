#!/usr/bin/env node
// Il bundle unico per Cloudflare Workers supera il limite di 3 MiB (compresso) del piano
// gratuito. Questo script compila due Worker separati dallo stesso albero src/: uno con
// solo le pagine/API pubbliche, uno con solo pannello admin/API admin. Sposta da parte le
// cartelle non pertinenti prima della build e le ripristina sempre, anche in caso di errore
// — src/components/* non va mai toccata: entrambe le build la usano (es. SiteShell importa
// AdminTour, AdminSidebar importa Logo).
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const appDir = join(root, "src", "app");
const apiDir = join(appDir, "api");
const holdingDir = join(root, ".build-split-holding");

const variant = process.argv[2];
if (!["public", "admin"].includes(variant)) {
  console.error("Uso: node scripts/build-split.mjs <public|admin>");
  process.exit(1);
}

async function pathsToMoveAside() {
  if (variant === "public") {
    return [join(appDir, "admin"), join(apiDir, "admin")];
  }
  // admin: tiene solo src/app/admin e src/app/api/admin (+ i file di root, condivisi).
  const apiEntries = await readdir(apiDir, { withFileTypes: true });
  const apiSiblings = apiEntries.filter((e) => e.isDirectory() && e.name !== "admin").map((e) => join(apiDir, e.name));
  return [join(appDir, "(public)"), join(appDir, "account"), ...apiSiblings];
}

async function moveAside(paths) {
  await rm(holdingDir, { recursive: true, force: true });
  await mkdir(holdingDir, { recursive: true });
  const moved = [];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const dest = join(holdingDir, moved.length.toString());
    await rename(p, dest);
    moved.push({ from: p, to: dest });
  }
  return moved;
}

async function restore(moved) {
  for (const { from, to } of moved) {
    await rename(to, from);
  }
  await rm(holdingDir, { recursive: true, force: true });
}

// L'output resta sempre in .open-next (default): la feature next/og (banner ritiri)
// incorpora un percorso assoluto legato a questa cartella durante la build, quindi
// rinominarla dopo rompe il caricamento dei suoi file WASM a runtime. Per questo motivo
// le due varianti non possono coesistere sul disco: si builda e si usa/deploya subito
// una alla volta (mai in parallelo).
const wranglerConfig = `wrangler.${variant}.toml`;
let moved = [];
try {
  moved = await moveAside(await pathsToMoveAside());
  console.log(`[build-split:${variant}] Spostate ${moved.length} cartelle, compilo...`);
  execSync(`rm -rf .next .open-next && npx opennextjs-cloudflare build --config ${wranglerConfig}`, { stdio: "inherit" });
  console.log(`[build-split:${variant}] Output in .open-next — usalo subito (deploy/dry-run) prima di lanciare l'altra variante.`);
} finally {
  await restore(moved);
  console.log(`[build-split:${variant}] Cartelle ripristinate.`);
}
