import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Le immagini di copertina e gli audio dei corsi sono ospitati su Cloudflare R2: le pagine
// pubbliche (URL pubblico *.r2.dev) e gli URL firmati per l'audio privato dei corsi a
// pagamento (*.r2.cloudflarestorage.com) devono essere autorizzati esplicitamente nel CSP,
// altrimenti il browser blocca il caricamento di immagini e audio.
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' serve solo in sviluppo (Fast Refresh/Turbopack); in produzione React non usa mai eval().
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // yoga-stargate.netlify.app in più a 'self': l'anteprima email carica sempre il logo da lì
  // (vedi EMAIL_ASSET_BASE) anche quando il pannello admin gira sul dominio personalizzato.
  "img-src 'self' data: blob: https://*.r2.dev https://yoga-stargate.netlify.app",
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
