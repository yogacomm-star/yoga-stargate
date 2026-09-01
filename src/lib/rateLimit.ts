const buckets = new Map<string, { count: number; resetAt: number }>();

// Semplice rate limiter in-memoria a finestra fissa, per singola istanza del processo.
// LIMITE NOTO: su un deployment serverless (es. Cloudflare Workers), richieste consecutive
// possono finire su isolate diversi ed effimeri, ognuno con la propria mappa: il
// limite reale può quindi essere più permissivo di quanto dichiarato. Per una protezione
// robusta contro brute-force distribuito servirebbe uno store condiviso (es. Upstash Redis).
// Resta comunque un primo filtro utile ed economico contro abusi non distribuiti.
export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function clientIp(request: Request): string {
  // Cloudflare valorizza questo header lato edge con il vero IP del client, sovrascrivendo
  // sempre un eventuale valore inviato dal browser: a differenza di "x-forwarded-for" (che un
  // client può impostare a piacere se non è già occupato da un hop precedente) non è
  // falsificabile dal chiamante, quindi va preferito quando presente.
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  if (cloudflareIp) return cloudflareIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

// Ripulisce periodicamente le entry scadute per evitare una crescita illimitata della mappa.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}
