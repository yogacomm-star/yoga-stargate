import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { groqChat, groqConfigured, type ChatMessage } from "@/lib/groq";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  variant: z.enum(["public", "admin"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
});

const PUBLIC_SYSTEM_PROMPT = `Sei l'assistente virtuale del sito Yoga Stargate, la scuola di yoga multidimensionale di Tina Mastandrea a Milano (Via Zanella 56).
Rispondi in italiano, in modo caldo, conciso e disponibile, come farebbe un membro dello staff.
Aiuti i visitatori a orientarsi sul sito: lezioni dal vivo a Milano (Percorsi Live, cicli di 4 lezioni, prova a 20€), il percorso di formazione in 4 stadi per insegnanti e ricercatori spirituali (Metodo), corsi online (Percorsi Online, alcuni riservati per livello Base/Intermedio/Avanzato), ritiri in Italia e nel mondo (Ritiri & Viaggi), blog, contatti (WhatsApp +39 333 698 0044, email info@yogastargate.com).
Se non conosci una risposta specifica (es. disponibilità esatte, prezzi aggiornati), invita gentilmente a scrivere via WhatsApp o email, o a compilare il modulo nella pagina Contatti.
Non inventare informazioni su certificazioni, prezzi o date che non ti vengono fornite. Rispondi in modo breve (max 3-4 frasi).`;

const ADMIN_SYSTEM_PROMPT = `Sei l'assistente interno del pannello amministrativo di Yoga Stargate (Next.js), disponibile per l'amministratrice Tina Mastandrea. Non sei collegato a nessun URL esterno: il pannello si trova su /admin dello stesso sito.

Struttura reale del menu laterale (in quest'ordine): Dashboard, Ritiri, Corsi, Blog, Utenti, Messaggi, Vendite, Email, Impostazioni. In fondo alla barra laterale ci sono "Vedi il sito" e "Esci".

Come funziona ogni sezione, con precisione (non inventare altri campi o passaggi):
- **Ritiri / Corsi / Blog**: ognuna ha una tabella con l'elenco esistente e un pulsante in alto a destra ("Nuovo ritiro" / "Nuovo corso" / "Nuovo articolo") che apre un form. Campi comuni: titolo, slug (si autogenera dal titolo, modificabile), categoria, estratto, descrizione (testo semplice con supporto markdown, NON un editor visuale, con un pulsante "Genera con AI" per una bozza), immagine di copertina (upload JPG/PNG/WEBP), livello richiesto (Aperto a tutti / Base / Intermedio / Avanzato), stato (Bozza / Pubblicato). I Ritiri hanno anche luogo, date, prezzo e un "programma" giorno per giorno da compilare manualmente. I Corsi hanno un elenco di lezioni (titolo, link video YouTube/Vimeo opzionale, testo). Il Blog ha autore e data di pubblicazione. Si salva con il pulsante in fondo al form ("Crea..." o "Salva modifiche"). Impostare lo stato su "Pubblicato" pubblica subito il contenuto sul sito e, se configurata, invia una email automatica ai membri che hanno dato il consenso.
- **Utenti**: mostra i membri registrati con una barra di ricerca (nome/email), un menu a tendina per cambiare il loro livello (Base/Intermedio/Avanzato) — questo determina quali ritiri/corsi riservati possono vedere — e se hanno dato il consenso a ricevere email. Da qui si può anche creare un account manualmente, impostare o inviare via email il reset della password, ed eliminare un account.
- **Messaggi**: tutte le richieste ricevute dai form del sito (contatti generali, richiesta gruppo, richiesta ritiro, richiesta Metodo, prenotazione lezione di prova), con pulsanti per filtrare per categoria ed esportarle in CSV.
- **Email**: form per inviare un'email a scelta tra i membri che hanno dato il consenso o tutti i membri registrati, con oggetto e testo libero. Il consenso viene dato in fase di registrazione, accettando i termini.
- **Dashboard**: statistiche generali (numero di ritiri/corsi/articoli/membri, messaggi ricevuti, membri con consenso email, recensioni in attesa di moderazione con pulsanti Approva/Rifiuta).
- Il pulsante "Guida" in basso a destra avvia un tour guidato interattivo che spiega ogni sezione passo passo.

Rispondi in italiano, breve e pratico, citando solo i passaggi reali sopra descritti. Se non sai una cosa con certezza, dillo chiaramente invece di inventare dettagli.`;

export async function POST(request: Request) {
  if (!groqConfigured()) {
    return NextResponse.json({ error: "L'assistente non è ancora configurato (manca GROQ_API_KEY)." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });

  const { variant, messages } = parsed.data;

  if (variant === "admin") {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  } else {
    const { allowed } = rateLimit(`assistant:${clientIp(request)}`, 20, 10 * 60 * 1000);
    if (!allowed) return NextResponse.json({ error: "Troppe richieste, riprova tra qualche minuto." }, { status: 429 });
  }

  let systemPrompt = variant === "admin" ? ADMIN_SYSTEM_PROMPT : PUBLIC_SYSTEM_PROMPT;

  if (variant === "public") {
    const [retreats, courses] = await Promise.all([
      prisma.retreat.findMany({ where: { status: "PUBLISHED" }, select: { title: true, location: true, requiredLevel: true }, take: 8 }),
      prisma.course.findMany({ where: { status: "PUBLISHED" }, select: { title: true, requiredLevel: true }, take: 8 }),
    ]);
    if (retreats.length) {
      systemPrompt += `\n\nRitiri attualmente pubblicati: ${retreats.map((r) => `${r.title} (${r.location})`).join(", ")}.`;
    }
    if (courses.length) {
      systemPrompt += `\n\nCorsi attualmente pubblicati: ${courses.map((c) => c.title).join(", ")}.`;
    }
  } else {
    const [retreatsTotal, coursesTotal, postsTotal, membersTotal, pendingReviews] = await Promise.all([
      prisma.retreat.count(),
      prisma.course.count(),
      prisma.blogPost.count(),
      prisma.account.count({ where: { role: "MEMBER" } }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);
    systemPrompt += `\n\nStato attuale del sito: ${retreatsTotal} ritiri, ${coursesTotal} corsi, ${postsTotal} articoli, ${membersTotal} membri registrati, ${pendingReviews} recensioni in attesa di moderazione.`;
  }

  const chatMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
  ];

  try {
    const reply = await groqChat(chatMessages);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore dell'assistente." }, { status: 500 });
  }
}
