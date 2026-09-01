// Il nome del cookie di sblocco vive in un file suo, separato da src/lib/siteLock.ts, perché
// serve anche a proxy.ts: importarlo da siteLock.ts tirerebbe Prisma dentro il bundle del
// middleware, che su Cloudflare Workers non riesce a caricare il driver del database.
export const SITE_LOCK_COOKIE = "ys_unlocked";
