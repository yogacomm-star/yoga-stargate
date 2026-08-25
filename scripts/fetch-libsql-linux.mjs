#!/usr/bin/env node
// Le funzioni Netlify girano su Linux x64, ma chi lancia `npm install` in locale è quasi
// sempre su un altro sistema operativo (Mac, in questo progetto): npm installa solo il
// binario nativo di libsql per la piattaforma corrente, quindi a runtime su Netlify manca
// "@libsql/linux-x64-gnu" e le richieste al database falliscono. Questo script lo scarica e
// lo estrae comunque (npm pack non applica il controllo os/cpu che blocca npm install),
// così resta disponibile nel bundle caricato su Netlify indipendentemente da dove si builda.
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, cpSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const target = "@libsql/linux-x64-gnu";
const destDir = join(process.cwd(), "node_modules", "@libsql", "linux-x64-gnu");
if (existsSync(join(destDir, "index.node"))) process.exit(0);

const libsqlPkg = join(process.cwd(), "node_modules", "libsql", "package.json");
if (!existsSync(libsqlPkg)) process.exit(0); // libsql non installato: niente da fare

const version = JSON.parse(readFileSync(libsqlPkg, "utf8")).optionalDependencies?.[target];
if (!version) process.exit(0);

const tmp = mkdtempSync(join(tmpdir(), "libsql-linux-"));
try {
  execSync(`npm pack ${target}@${version} --pack-destination "${tmp}"`, { stdio: "inherit" });
  const tarball = join(tmp, `libsql-linux-x64-gnu-${version}.tgz`);
  execSync(`tar -xzf "${tarball}" -C "${tmp}"`, { stdio: "inherit" });
  cpSync(join(tmp, "package"), destDir, { recursive: true });
  console.log(`[fetch-libsql-linux] ${target}@${version} pronto per il deploy su Netlify.`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
