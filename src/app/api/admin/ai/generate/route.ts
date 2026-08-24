import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { groqJson, groqConfigured } from "@/lib/groq";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { slugify } from "@/lib/slug";

const schema = z.object({
  kind: z.enum(["retreat", "course", "post"]),
  topic: z.string().trim().min(2).max(300),
});

const BRAND_VOICE =
  "Sei una copywriter esperta di yoga e benessere che scrive per Yoga Stargate, la scuola di yoga multidimensionale di Tina Mastandrea a Milano. Il tono è caldo, evocativo ma concreto: mai esagerato, mai new-age generico o pieno di cliché. Scrivi sempre e solo in italiano.";

type RetreatDraft = {
  title: string;
  category: string;
  location: string;
  excerpt: string;
  description: string;
  itinerary: { day: number; title: string; description: string }[];
};
type CourseDraft = {
  title: string;
  category: string;
  excerpt: string;
  description: string;
  lessons: { title: string; content: string }[];
};
type PostDraft = { title: string; category: string; excerpt: string; content: string };

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!groqConfigured()) {
    return NextResponse.json({ error: "Assistente AI non configurato (manca GROQ_API_KEY)." }, { status: 400 });
  }

  const { allowed } = rateLimit(`ai-generate:${clientIp(request)}`, 15, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste, riprova più tardi." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi." }, { status: 400 });

  const { kind, topic } = parsed.data;

  try {
    if (kind === "retreat") {
      const draft = await groqJson<RetreatDraft>(
        [
          {
            role: "system",
            content: `${BRAND_VOICE} Devi progettare un ritiro di yoga a partire da un argomento fornito dall'amministratrice. Rispondi SOLO con un oggetto JSON con questa forma esatta: {"title": string, "category": "Trasformativo"|"Esperienziale"|"Consapevolezza"|"Viaggio", "location": string, "excerpt": string (max 35 parole), "description": string (3-4 paragrafi separati da \\n\\n, circa 150 parole), "itinerary": [{"day": number, "title": string, "description": string (1-2 frasi)}]} con 2-4 giorni di programma coerenti con la durata implicita nell'argomento.`,
          },
          { role: "user", content: `Argomento/titolo di partenza: "${topic}"` },
        ],
        1500
      );
      return NextResponse.json({
        title: draft.title,
        slug: slugify(draft.title),
        category: draft.category,
        location: draft.location,
        excerpt: draft.excerpt,
        description: draft.description,
        itinerary: draft.itinerary.map((d, i) => ({ day: i + 1, title: d.title, description: d.description })),
      });
    }

    if (kind === "course") {
      const draft = await groqJson<CourseDraft>(
        [
          {
            role: "system",
            content: `${BRAND_VOICE} Devi progettare un corso online (video/testo) a partire da un argomento fornito dall'amministratrice. Rispondi SOLO con un oggetto JSON con questa forma esatta: {"title": string, "category": string breve, "excerpt": string (max 35 parole), "description": string (3-4 paragrafi separati da \\n\\n, circa 150 parole), "lessons": [{"title": string, "content": string (2-3 frasi che riassumono la lezione)}]} con 3-6 lezioni in ordine logico.`,
          },
          { role: "user", content: `Argomento/titolo di partenza: "${topic}"` },
        ],
        1500
      );
      return NextResponse.json({
        title: draft.title,
        slug: slugify(draft.title),
        category: draft.category,
        excerpt: draft.excerpt,
        description: draft.description,
        lessons: draft.lessons.map((l) => ({ title: l.title, videoUrl: "", content: l.content })),
      });
    }

    const draft = await groqJson<PostDraft>(
      [
        {
          role: "system",
          content: `${BRAND_VOICE} Devi scrivere un articolo di blog a partire da un argomento fornito dall'amministratrice. Rispondi SOLO con un oggetto JSON con questa forma esatta: {"title": string, "category": string breve, "excerpt": string (max 35 parole), "content": string in formato markdown (4-6 paragrafi, circa 300 parole, con un'apertura che cattura l'attenzione)}.`,
        },
        { role: "user", content: `Argomento/titolo di partenza: "${topic}"` },
      ],
      1500
    );
    return NextResponse.json({
      title: draft.title,
      slug: slugify(draft.title),
      category: draft.category,
      excerpt: draft.excerpt,
      content: draft.content,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore." }, { status: 500 });
  }
}
