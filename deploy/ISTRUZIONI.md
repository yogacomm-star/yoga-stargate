# Mettere online Yoga Stargate (gratis, tutto su Cloudflare)

Schema: **Cloudflare Workers** fa girare il sito (due Worker separati: sito pubblico e
pannello admin, per stare sotto il limite di dimensione del piano gratuito), **Turso**
conserva i dati, **Cloudflare R2** ospita immagini e audio, **Cloudflare** gestisce anche
il dominio. Nessuna carta di credito richiesta in nessuno dei passaggi (il piano gratuito
di R2 non richiede carta; Workers/DNS nemmeno).

## 1. Database — Turso

1. Crea un account su https://turso.tech (gratis, senza carta).
2. Installa la CLI e fai login (da terminale, nella cartella del progetto):
   ```
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```
3. Crea il database:
   ```
   turso db create yoga-stargate
   ```
4. Recupera l'URL di connessione e il token:
   ```
   turso db show yoga-stargate --url
   turso db tokens create yoga-stargate
   ```
   Tieni a portata questi due valori: ti servono al passo 3 (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
5. Applica la struttura del database (le tabelle) al database remoto, eseguendo in ordine
   i file di migrazione già presenti nel progetto:
   ```
   turso db shell yoga-stargate < prisma/migrations/20260821130201_init/migration.sql
   turso db shell yoga-stargate < prisma/migrations/20260822105947_add_phone_google_auth/migration.sql
   turso db shell yoga-stargate < prisma/migrations/20260823120057_add_password_reset_token/migration.sql
   ```
6. (Facoltativo ma consigliato) Popola l'account amministratore iniziale:
   ```
   TURSO_DATABASE_URL="<url dal passo 4>" TURSO_AUTH_TOKEN="<token dal passo 4>" npx tsx prisma/seed.ts
   ```

## 2. Storage — Cloudflare R2

Immagini (copertine ritiri/corsi/blog) e audio delle lezioni vivono su due bucket R2:
uno pubblico (`yoga-stargate-media`) e uno privato senza accesso diretto
(`yoga-stargate-media-private`, per l'audio dei corsi a pagamento — vedi `src/lib/r2.ts`).

1. Nella dashboard Cloudflare: **R2 > Crea bucket**, crealo due volte con questi nomi
   (o nomi a tua scelta, purché poi coincidano con `R2_BUCKET_NAME`/`R2_PRIVATE_BUCKET_NAME`):
   - `yoga-stargate-media`
   - `yoga-stargate-media-private`
2. Sul bucket pubblico (`yoga-stargate-media`): **Settings > Public access**, abilita l'accesso
   pubblico (dominio `*.r2.dev` va bene) e copia l'URL: ti serve per `R2_PUBLIC_URL`.
   Il bucket privato resta senza accesso pubblico: ci si arriva solo con URL firmati generati
   dal server (`getPresignedAudioUrl`).
3. **R2 > Gestisci token API > Crea token API**, con permessi di lettura/scrittura su entrambi
   i bucket. Ottieni `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`.
4. `R2_ACCOUNT_ID` è l'ID account Cloudflare, visibile nella barra laterale destra della
   dashboard (o nell'URL `dash.cloudflare.com/<account-id>/...`).

## 3. Hosting — Cloudflare Workers

Il bundle di tutta l'app supera il limite di 3 MiB (compresso) del piano Workers gratuito,
quindi si compila e si deploya come **due Worker separati** dallo stesso codice: uno con solo
le pagine pubbliche (`yoga-stargate-public`), uno con solo il pannello admin
(`yoga-stargate-admin`). Lo fa `scripts/build-split.mjs`, richiamato dagli script npm sotto —
non serve lanciarlo a mano.

1. Crea un account su https://cloudflare.com (gratis, senza carta) se non l'hai già.
2. Login da terminale, nella cartella del progetto:
   ```
   npx wrangler login
   ```
3. Imposta i segreti (variabili d'ambiente lette a runtime dal Worker) **su entrambi** i Worker
   — servono su tutti e due perché condividono buona parte del codice server (`src/lib/*`):
   ```
   for cfg in wrangler.public.toml wrangler.admin.toml; do
     npx wrangler secret put TURSO_DATABASE_URL --config $cfg
     npx wrangler secret put TURSO_AUTH_TOKEN --config $cfg
     npx wrangler secret put SESSION_SECRET --config $cfg
     npx wrangler secret put ADMIN_EMAIL --config $cfg
     npx wrangler secret put ADMIN_PASSWORD --config $cfg
     npx wrangler secret put RESEND_API_KEY --config $cfg
     npx wrangler secret put EMAIL_FROM --config $cfg
     npx wrangler secret put GROQ_API_KEY --config $cfg
     npx wrangler secret put GOOGLE_CLIENT_ID --config $cfg
     npx wrangler secret put GOOGLE_CLIENT_SECRET --config $cfg
     npx wrangler secret put GOOGLE_DRIVE_API_KEY --config $cfg
     npx wrangler secret put R2_ACCOUNT_ID --config $cfg
     npx wrangler secret put R2_ACCESS_KEY_ID --config $cfg
     npx wrangler secret put R2_SECRET_ACCESS_KEY --config $cfg
     npx wrangler secret put R2_PUBLIC_URL --config $cfg
   done
   ```
   Ogni comando chiede il valore da terminale (non resta nella history della shell).
   `R2_BUCKET_NAME`/`R2_PRIVATE_BUCKET_NAME` sono facoltativi: se li salti, il codice usa
   di default `yoga-stargate-media`/`yoga-stargate-media-private` (vedi passo 2).

   `NEXT_PUBLIC_SITE_URL` **non** va messa qui: è una variabile pubblica che Next.js incorpora
   nel codice JavaScript durante la compilazione, non letta a runtime — va impostata nella shell
   prima di ogni build (passo 4), con lo **stesso valore** (`https://www.yogastargate.com`) sia
   per la build pubblica che per quella admin, perché entrambe la usano per generare link assoluti
   verso il sito pubblico (reset password, redirect OAuth Google, sitemap...).

4. Compila e pubblica ciascun Worker (uno alla volta: le due build usano la stessa cartella
   `.open-next` e non possono coesistere sul disco):
   ```
   export NEXT_PUBLIC_SITE_URL="https://www.yogastargate.com"
   npm run cf:deploy:public
   npm run cf:deploy:admin
   ```
   Ogni comando compila (`opennextjs-cloudflare build`) e pubblica (`wrangler deploy`) con la
   rispettiva configurazione (`wrangler.public.toml` / `wrangler.admin.toml`).
5. Al termine avrai due indirizzi tipo `https://yoga-stargate-public.<tuo-account>.workers.dev`
   e `https://yoga-stargate-admin.<tuo-account>.workers.dev`, già funzionanti: utilizzabili da
   subito, anche prima di collegare un dominio.

Nota dimensione bundle: al momento della stesura di questa guida entrambe le build stanno
appena sotto il limite gratuito di 3 MiB compressi (circa il 96-98% del limite). Se il sito
cresce (nuove dipendenze, nuove pagine) e una build supera il limite, `npm run cf:deploy:*`
fallisce con un errore chiaro di `wrangler` sulla dimensione — a quel punto va ridotta una
dipendenza pesante o passato al piano Workers a pagamento.

## 4. Dominio — Cloudflare

Il pannello admin vive su un sottodominio separato dal sito pubblico
(`admin.yogastargate.com`), così i due Worker non si contendono gli stessi file statici
(`_next/*`) sullo stesso host. `wrangler.public.toml` e `wrangler.admin.toml` dichiarano già
i domini da collegare.

1. Se il dominio non è ancora su Cloudflare: registralo (su Cloudflare Registrar o altrove) e
   aggiungilo come zona DNS al tuo account Cloudflare.
2. Rilancia `npm run cf:deploy:public` e `npm run cf:deploy:admin` (passo 3.4): `wrangler`
   legge i blocchi `routes` con `custom_domain = true` nei due file `wrangler.*.toml` e crea
   automaticamente i record DNS e i certificati SSL per:
   - `yogastargate.com` e `www.yogastargate.com` → Worker pubblico
   - `admin.yogastargate.com` → Worker admin
3. Il pannello admin resta comunque sotto il percorso `/admin` anche sul sottodominio
   (es. `admin.yogastargate.com/admin`): la form di login reindirizza automaticamente chi
   visita una pagina protetta senza sessione.
4. `NEXT_PUBLIC_SITE_URL` (passo 3.3) deve restare il dominio pubblico
   (`https://www.yogastargate.com`) anche per la build admin — non `admin.yogastargate.com`.

## File di questo progetto legati al deploy

- `wrangler.public.toml` / `wrangler.admin.toml` — configurazione dei due Worker (build,
  domini personalizzati, binding degli asset statici).
- `scripts/build-split.mjs` — compila due Worker separati dallo stesso `src/app` spostando
  temporaneamente le cartelle non pertinenti prima della build.
- `open-next.config.ts` — configurazione dell'adapter `@opennextjs/cloudflare`.
- `src/lib/prisma.ts` — si collega automaticamente a Turso in produzione (quando
  `TURSO_DATABASE_URL` è impostata) e al file locale in sviluppo: nessun'altra modifica
  al codice è necessaria.
- `src/lib/r2.ts` — client S3-compatibile per i due bucket R2 (pubblico e privato).
