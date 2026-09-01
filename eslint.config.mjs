import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Resti del vecchio deploy su Netlify: la cartella non è più prodotta da nulla, si può
    // cancellare a mano (non è tracciata da git).
    ".netlify/**",
    // Output di build e codice generato: non è nostro, e senza escluderlo `npm run lint`
    // annega i problemi veri sotto migliaia di segnalazioni sui bundle.
    ".open-next/**",
    ".wrangler/**",
    "src/generated/**",
    "cloudflare-env.d.ts",
  ]),
]);

export default eslintConfig;
