# Yoga Stargate

Sito di Yoga Stargate — la scuola di yoga multidimensionale di Tina Mastandrea a Milano: pagine
pubbliche (metodo, ritiri, corsi online, blog), area riservata per gli iscritti e pannello di
amministrazione per gestire contenuti, utenti, vendite e messaggi.

## Stack

- **Next.js 16** (App Router) e React 19
- **Tailwind CSS 4** — i colori e i raggi del sito sono definiti come token in `src/app/globals.css`
- **Prisma 6** con adapter **libSQL**: file SQLite in locale, database **Turso** in produzione
- **Cloudflare Workers** come piattaforma di deploy, tramite **OpenNext**
- **Cloudflare R2** per immagini e audio, **Stripe** per i pagamenti, **Resend** per le email,
  **Groq** per l'assistente AI

## Avvio in locale

```bash
npm install
npx prisma migrate dev
npm run dev
```

Il sito parte su http://localhost:3000, il pannello su http://localhost:3000/admin (le credenziali
iniziali sono quelle di `ADMIN_EMAIL`/`ADMIN_PASSWORD`; per popolare il database con contenuti di
esempio: `npx prisma db seed`).

## Variabili d'ambiente

Stanno in `.env` per lo sviluppo con `next dev` e in `.dev.vars` per l'anteprima Workers
(`npm run preview`). Nessuno dei due file va committato.

| Variabile | A cosa serve |
| --- | --- |
| `DATABASE_URL` | Database SQLite locale. **Path assoluto obbligatorio**: la CLI di Prisma risolve i path relativi rispetto a `prisma/`, il runtime rispetto alla root. Se sposti la cartella del progetto, va aggiornata. |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Database di produzione. Quando ci sono, hanno la precedenza su `DATABASE_URL`. |
| `SESSION_SECRET` | Firma i cookie di sessione. |
| `NEXT_PUBLIC_SITE_URL` | URL pubblico: meta tag, sitemap, robots, link nelle email. |
| `NEXT_PUBLIC_EMAIL_ASSET_BASE` | Facoltativa: origine da cui le email caricano il logo, se diversa dal sito (va autorizzata anche nella CSP, se ne occupa `next.config.ts`). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Account admin creato dal seed. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Invio email. Senza, l'invio è disattivato e il pannello lo segnala. |
| `GROQ_API_KEY` | Assistente AI in chat e generazione bozze nel pannello. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | "Continua con Google". Redirect da autorizzare: `<sito>/api/auth/google/callback`. |
| `GOOGLE_DRIVE_API_KEY` | Importazione corsi da una cartella Drive pubblica. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout corsi e lezione di prova. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL` | Storage immagini (pubbliche) e audio dei corsi (privato). Senza, i caricamenti sono disattivati. |

Le funzionalità legate a una chiave mancante si disattivano da sole e lo dicono nel pannello: il
sito resta comunque avviabile con il solo database.

## Database e migrazioni

In locale si usa il flusso standard di Prisma (`npx prisma migrate dev`).

In produzione **non** si può usare `prisma migrate deploy`: il motore di migrazione di Prisma
richiede uno SQLite locale e rifiuta gli URL `libsql://` di Turso. Le migrazioni vengono quindi
applicate da `scripts/migrate-production.mjs`, che le esegue con lo stesso client libSQL usato a
runtime. Lo script è idempotente ed è già collegato al comando di deploy.

> Quando aggiungi una migrazione che deve arrivare anche in produzione, aggiungi il blocco
> corrispondente in `scripts/migrate-production.mjs`: non esiste una tabella che tenga traccia di
> quali migrazioni sono già state applicate.

## Deploy (Cloudflare Workers)

```bash
npm run deploy
```

Il comando applica le migrazioni a Turso, costruisce il bundle OpenNext e pubblica il Worker. La
configurazione della piattaforma sta in `wrangler.jsonc` (binding immagini, asset statici,
self-reference per la cache) e in `open-next.config.ts`.

Per provare il bundle Workers in locale prima di pubblicare:

```bash
npm run preview
```

L'anteprima gira in `workerd`, che non ha accesso al filesystem: per le pagine che leggono il
database servono `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` in `.dev.vars`, puntate a un database di
sviluppo (`DATABASE_URL` con un path `file:` lì non funziona).

## Note utili

- **Blocco del sito**: dal pannello (Impostazioni) si può chiudere tutto il sito dietro un codice
  generato al momento. Finché è attivo, `robots.txt` diventa `Disallow: /` e ogni pagina rimanda a
  `/entrata`.
- **Rate limiting**: `src/lib/rateLimit.ts` è in memoria per singolo isolate. Su Workers è un
  filtro utile contro gli abusi banali, non una protezione robusta contro un brute-force
  distribuito: per quella servirebbe uno store condiviso.
- **Pagine di errore**: `src/app/not-found.tsx`, `error.tsx` e `global-error.tsx` (più le varianti
  dentro `(public)` e nel pannello admin) sostituiscono le schermate di default di Next.
