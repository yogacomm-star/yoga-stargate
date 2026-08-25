# Mettere online Yoga Stargate (gratis)

Schema: **Netlify** fa girare il sito (identico a "npm run dev" ma sempre acceso, senza
limiti artificiali di dimensione del bundle), **Turso** conserva i dati, **Cloudflare R2**
ospita immagini e audio, **Cloudflare** gestisce il dominio (solo DNS). Nessuna carta di
credito richiesta in nessuno dei passaggi.

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
R2 è indipendente dall'hosting: resta lo stesso qualunque piattaforma esegua il sito.

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

## 3. Hosting — Netlify

1. Crea un account su https://netlify.com (gratis, senza carta, si può accedere anche con GitHub).
2. Login da terminale, nella cartella del progetto (apre il browser per l'autorizzazione):
   ```
   npx netlify-cli login
   ```
3. Collega la cartella del progetto a un progetto Netlify (una volta sola):
   ```
   npx netlify-cli sites:create --name yoga-stargate
   ```
   (se il nome è già preso, Netlify te ne propone uno alternativo). Il comando collega
   automaticamente il progetto alla cartella corrente.
4. Imposta le variabili d'ambiente (lette a runtime dal sito):
   ```
   npx netlify-cli env:set TURSO_DATABASE_URL "<dal passo 1.4>"
   npx netlify-cli env:set TURSO_AUTH_TOKEN "<dal passo 1.4>"
   npx netlify-cli env:set SESSION_SECRET "<stringa lunga e casuale, es. openssl rand -base64 32>"
   npx netlify-cli env:set NEXT_PUBLIC_SITE_URL "https://yoga-stargate.netlify.app"
   npx netlify-cli env:set ADMIN_EMAIL "<email admin>"
   npx netlify-cli env:set ADMIN_PASSWORD "<password admin>"
   npx netlify-cli env:set RESEND_API_KEY "<dal tuo account Resend>"
   npx netlify-cli env:set EMAIL_FROM "<mittente email>"
   npx netlify-cli env:set GROQ_API_KEY "<dal tuo account Groq>"
   npx netlify-cli env:set GOOGLE_CLIENT_ID "<da Google Cloud Console>"
   npx netlify-cli env:set GOOGLE_CLIENT_SECRET "<da Google Cloud Console>"
   npx netlify-cli env:set GOOGLE_DRIVE_API_KEY "<da Google Cloud Console>"
   npx netlify-cli env:set R2_ACCOUNT_ID "<dal passo 2.4>"
   npx netlify-cli env:set R2_ACCESS_KEY_ID "<dal passo 2.3>"
   npx netlify-cli env:set R2_SECRET_ACCESS_KEY "<dal passo 2.3>"
   npx netlify-cli env:set R2_PUBLIC_URL "<dal passo 2.2>"
   ```
   `NEXT_PUBLIC_SITE_URL` va aggiornata al passo 4.4 col dominio definitivo.
   `R2_BUCKET_NAME`/`R2_PRIVATE_BUCKET_NAME` sono facoltativi: se li salti, il codice usa
   di default `yoga-stargate-media`/`yoga-stargate-media-private` (vedi passo 2).
5. Avvia il deploy:
   ```
   npx netlify-cli deploy --build --prod
   ```
   Compila il sito (`next build`, con `@netlify/plugin-nextjs` che adatta l'output al
   runtime Netlify) e lo pubblica. Al termine avrai un indirizzo tipo
   `https://yoga-stargate.netlify.app` già funzionante.

Nota: a differenza del piano gratuito di Render, le funzioni Netlify non "si addormentano"
dopo un periodo di inattività — nessuna attesa sulla prima richiesta del giorno.

## 4. Dominio — Cloudflare

Se vuoi un dominio tuo (es. `yogastargate.com`) invece del `.netlify.app`:

1. Registra il dominio (su Cloudflare Registrar o altrove) e aggiungilo al tuo account
   Cloudflare come zona DNS, se non l'hai già fatto.
2. Su Netlify: **Site configuration > Domain management > Add a domain**, inserisci il tuo
   dominio (sia `yogastargate.com` che `www.yogastargate.com`). Netlify mostra i record DNS
   da creare (in genere un `CNAME` verso `<nome-progetto>.netlify.app` per `www`, e un record
   `A`/`ALIAS` per l'apex `yogastargate.com`).
3. Su Cloudflare, nella sezione DNS della tua zona, crea quei record con i valori indicati da
   Netlify. Lascia il proxy Cloudflare (nuvoletta arancione) attivo se vuoi anche la
   protezione/CDN gratuita di Cloudflare.
4. Aggiorna `NEXT_PUBLIC_SITE_URL` su Netlify col dominio definitivo e rilancia il deploy:
   ```
   npx netlify-cli env:set NEXT_PUBLIC_SITE_URL "https://www.yogastargate.com"
   npx netlify-cli deploy --build --prod
   ```

Il pannello admin resta sotto `/admin` sullo stesso dominio del sito pubblico (es.
`yogastargate.com/admin`) — non serve un sottodominio separato: Netlify non ha il limite di
dimensione del bundle che su Cloudflare Workers costringeva a dividere la build in due.

## File di questo progetto legati al deploy

- `netlify.toml` — configurazione del build Netlify (comando, plugin Next.js).
- `src/lib/prisma.ts` — si collega automaticamente a Turso in produzione (quando
  `TURSO_DATABASE_URL` è impostata) e al file locale in sviluppo: nessun'altra modifica
  al codice è necessaria.
- `src/lib/r2.ts` — client S3-compatibile per i due bucket R2 (pubblico e privato).
