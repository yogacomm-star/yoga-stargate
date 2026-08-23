# Mettere online Yoga Stargate (gratis, dominio via Cloudflare)

Schema: **Render** fa girare il sito (identico a "npm run dev" ma sempre acceso), **Turso**
conserva i dati al posto del file locale, **Cloudflare** gestisce solo il nome a dominio.
Nessuna carta di credito richiesta in nessuno dei tre passaggi.

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

## 2. Hosting — Render

1. Crea un account su https://render.com (gratis, senza carta, si può accedere anche con GitHub).
2. Assicurati che il progetto sia su GitHub (crea un repository e fai push di questa cartella,
   se non l'hai già fatto).
3. Su Render: **New > Blueprint**, collega il repository. Render legge automaticamente il file
   `render.yaml` già presente nel progetto e propone il servizio da creare.
4. Prima di confermare, apri le variabili d'ambiente del servizio e imposta i valori mancanti
   (quelli lasciati vuoti apposta nel blueprint perché sono segreti):
   - `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` — dal passo 1.4
   - `SESSION_SECRET` — una stringa lunga e casuale a tua scelta (es. generata con
     `openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` — il dominio che userai (es. `https://tuodominio.it`), anche
     temporaneo tipo `https://yoga-stargate.onrender.com` finché non colleghi il dominio
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — le credenziali dell'account amministratore
   - `RESEND_API_KEY` / `EMAIL_FROM` — per l'invio email (newsletter, reset password)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — per il login con Google
   - `GROQ_API_KEY` — per l'assistente AI, se lo usi
5. Avvia il deploy. Render clona il repository, esegue `npm install` (che genera
   automaticamente il client Prisma) e `npm run build`, poi avvia il sito.
6. Al termine avrai un indirizzo tipo `https://yoga-stargate.onrender.com` già funzionante:
   è il tuo dominio temporaneo, utilizzabile da subito.

Nota: il piano gratuito di Render "si addormenta" dopo circa 15 minuti senza visite e la
richiesta successiva impiega qualche secondo in più a rispondere (il sito comunque riparte
da solo, nessun intervento necessario).

## 3. Dominio — Cloudflare

Se vuoi un dominio tuo (es. `yogastargate.it`) invece del `.onrender.com`:

1. Registra il dominio (su Cloudflare Registrar o altrove) e aggiungilo al tuo account
   Cloudflare come zona DNS.
2. Su Render, nella pagina del servizio: **Settings > Custom Domains > Add Custom Domain**,
   inserisci il tuo dominio. Render mostra un record DNS da creare (in genere un `CNAME`
   verso `yoga-stargate.onrender.com`).
3. Su Cloudflare, nella sezione DNS della tua zona, crea quel record `CNAME` con l'host
   indicato da Render. Lascia il proxy Cloudflare (nuvoletta arancione) attivo se vuoi anche
   la protezione/CDN gratuita di Cloudflare.
4. Aggiorna `NEXT_PUBLIC_SITE_URL` su Render con il dominio definitivo e riavvia il servizio.

## File di questo progetto legati al deploy

- `render.yaml` — configurazione del servizio Render (build, avvio, variabili richieste).
- `src/lib/prisma.ts` — si collega automaticamente a Turso in produzione (quando
  `TURSO_DATABASE_URL` è impostata) e al file locale in sviluppo: nessun'altra modifica
  al codice è necessaria.
