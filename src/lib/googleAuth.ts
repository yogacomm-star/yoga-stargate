// L'indirizzo di ritorno per Google deve corrispondere esattamente a dove l'utente sta
// davvero navigando (es. il dominio temporaneo *.netlify.app finché non è collegato quello
// definitivo): usiamo sempre l'origin della richiesta in corso, mai un dominio fisso, così
// il login funziona su qualunque indirizzo il sito sia effettivamente raggiungibile.
export function googleAuthConfigured(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}

export function publicOrigin(requestOrigin: string): string {
  return requestOrigin;
}

export function googleRedirectUri(origin: string): string {
  return `${publicOrigin(origin)}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, origin: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Scambio del codice Google fallito.");
  return res.json() as Promise<{ access_token: string; id_token: string }>;
}

export async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Impossibile recuperare il profilo Google.");
  return res.json() as Promise<{ sub: string; email: string; name?: string; picture?: string; email_verified?: boolean }>;
}
