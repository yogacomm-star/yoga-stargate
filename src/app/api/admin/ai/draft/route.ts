import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { groqChat, groqConfigured } from "@/lib/groq";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  kind: z.enum(["retreat", "course", "post"]),
  field: z.enum(["excerpt", "description", "content"]),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional(),
  location: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(500).optional(),
});

const KIND_LABEL: Record<string, string> = {
  retreat: "un ritiro di yoga",
  course: "un corso di yoga online",
  post: "un articolo del blog",
};

const FIELD_INSTRUCTIONS: Record<string, { instructions: string; maxTokens: number }> = {
  excerpt: {
    instructions:
      "Scrivi un estratto breve (massimo 2 frasi, circa 25-35 parole) da usare come anteprima in una card. Deve incuriosire senza essere generico.",
    maxTokens: 120,
  },
  description: {
    instructions:
      "Scrivi una descrizione completa (3-4 paragrafi brevi separati da una riga vuota, circa 120-180 parole) che presenti l'esperienza in modo concreto ed evocativo.",
    maxTokens: 420,
  },
  content: {
    instructions:
      "Scrivi il testo completo di un articolo di blog in formato markdown (4-6 paragrafi, circa 250-350 parole), con un'apertura che cattura l'attenzione e un tono informativo ma personale.",
    maxTokens: 900,
  },
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!groqConfigured()) {
    return NextResponse.json({ error: "Assistente AI non configurato (manca GROQ_API_KEY)." }, { status: 400 });
  }

  const { allowed } = rateLimit(`ai-draft:${clientIp(request)}`, 30, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste, riprova più tardi." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const { kind, field, title, category, location, notes } = parsed.data;
  const { instructions, maxTokens } = FIELD_INSTRUCTIONS[field];

  const details = [
    `Titolo: "${title}"`,
    category ? `Categoria: ${category}` : null,
    location ? `Luogo: ${location}` : null,
    notes ? `Altri dettagli forniti dall'amministratrice: ${notes}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  try {
    const text = await groqChat(
      [
        {
          role: "system",
          content: `Sei una copywriter esperta di yoga e benessere che scrive per Yoga Stargate, la scuola di yoga multidimensionale di Tina Mastandrea a Milano. Il tono è caldo, evocativo ma concreto: mai esagerato, mai new-age generico o pieno di cliché. Scrivi sempre e solo in italiano. Stai scrivendo per ${KIND_LABEL[kind]}. ${instructions} Rispondi SOLO con il testo richiesto, senza titoli, virgolette o note aggiuntive.`,
        },
        { role: "user", content: details },
      ],
      maxTokens
    );
    return NextResponse.json({ text: text.replace(/^["“]|["”]$/g, "").trim() });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore." }, { status: 500 });
  }
}
