import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { groqChat, groqConfigured } from "@/lib/groq";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { BRAND_VOICE, AUDIENCE_BY_KIND } from "@/lib/aiCopy";

const schema = z.object({
  kind: z.enum(["retreat", "course", "post"]),
  field: z.enum(["excerpt", "description", "content"]),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional(),
  location: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(500).optional(),
  // Il contenuto già presente nel campo, se l'amministratrice ha già scritto qualcosa: quando
  // c'è, il compito dell'AI cambia da "scrivi da zero" a "migliora questo mantenendo le sue
  // idee", invece di sostituire sempre tutto con un testo nuovo.
  existingText: z.string().trim().max(6000).optional(),
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

  const { kind, field, title, category, location, notes, existingText } = parsed.data;
  const { instructions, maxTokens } = FIELD_INSTRUCTIONS[field];
  const hasExisting = !!existingText && existingText.length > 0;

  const details = [
    `Titolo: "${title}"`,
    category ? `Categoria: ${category}` : null,
    location ? `Luogo: ${location}` : null,
    notes ? `Altri dettagli forniti dall'amministratrice: ${notes}` : null,
    hasExisting ? `Testo già scritto da migliorare:\n"""\n${existingText}\n"""` : null,
  ]
    .filter(Boolean)
    .join(". ");

  // Due compiti diversi, non variazioni dello stesso: se c'è già un testo, il compito è
  // migliorarlo mantenendo idee, informazioni e voce di chi lo ha scritto — non sostituirlo
  // con uno nuovo, che è quello che succedeva prima a ogni click, anche su un campo già pieno.
  const taskInstructions = hasExisting
    ? `L'amministratrice ha già scritto un testo per questo campo: il tuo compito è MIGLIORARLO, non riscriverlo da zero. Mantieni le sue idee, i dettagli concreti che ha inserito e per quanto possibile il suo modo di esprimersi; intervieni solo su chiarezza, ritmo ed efficacia, e completa ciò che manca. ${instructions}`
    : instructions;

  try {
    const text = await groqChat(
      [
        {
          role: "system",
          content: `${BRAND_VOICE} Stai scrivendo per ${KIND_LABEL[kind]}. ${AUDIENCE_BY_KIND[kind]} ${taskInstructions} Rispondi SOLO con il testo richiesto, senza titoli, virgolette o note aggiuntive.`,
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
