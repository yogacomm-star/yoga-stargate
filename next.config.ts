import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Origine da cui l'anteprima email nel pannello admin carica il logo (vedi EMAIL_ASSET_BASE in
// src/lib/site.ts). Se coincide con il sito è già coperta da 'self'; va aggiunta alla CSP solo
// quando la si è puntata a un dominio diverso.
const emailAssetOrigin = process.env.NEXT_PUBLIC_EMAIL_ASSET_BASE?.replace(/\/$/, "");
const extraImgSrc = emailAssetOrigin ? ` ${emailAssetOrigin}` : "";

// Le immagini di copertina e gli audio dei corsi sono ospitati su Cloudflare R2: le pagine
// pubbliche (URL pubblico *.r2.dev) e gli URL firmati per l'audio privato dei corsi a
// pagamento (*.r2.cloudflarestorage.com) devono essere autorizzati esplicitamente nel CSP,
// altrimenti il browser blocca il caricamento di immagini e audio.
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' serve solo in sviluppo (Fast Refresh/Turbopack); in produzione React non usa mai eval().
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.r2.dev${extraImgSrc}`,
  "media-src 'self' https://*.r2.dev https://*.r2.cloudflarestorage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.r2.dev https://*.r2.cloudflarestorage.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Nasconde l'indicatore di sviluppo di Next.js (il badge in basso a sinistra in dev).
  devIndicators: false,
  // Le copertine di ritiri/corsi/articoli caricate su R2 sono servite da un dominio esterno:
  // next/image le blocca finché l'host non è esplicitamente autorizzato qui.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.r2.dev" }],
    // Ogni upload finisce su una chiave R2 con UUID nuovo (mai sovrascritta): l'immagine
    // ottimizzata può quindi restare in cache a lungo (default Next: 4h) senza rischio di
    // servire una versione vecchia. Il dominio pub-*.r2.dev di Cloudflare non è pensato per
    // la produzione (nessuna CDN/cache propria, rate limit stringenti): allungare la cache
    // qui riduce quanto spesso l'ottimizzatore deve ripescare l'originale da lì.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

// Dà a `next dev` accesso ai binding Cloudflare (R2, ecc.) definiti in wrangler.jsonc, così
// il comportamento in sviluppo è coerente con quello dopo il deploy su Workers.
import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
