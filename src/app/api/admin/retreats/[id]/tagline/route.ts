import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { groqChat, groqConfigured } from "@/lib/groq";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  if (!groqConfigured()) {
    return NextResponse.json({ error: "Assistente AI non configurato (manca GROQ_API_KEY)." }, { status: 400 });
  }

  const { allowed } = rateLimit(`tagline:${clientIp(request)}`, 20, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Troppe richieste, riprova più tardi." }, { status: 429 });

  const { id } = await params;
  const retreat = await prisma.retreat.findUnique({ where: { id } });
  if (!retreat) return NextResponse.json({ error: "Ritiro non trovato." }, { status: 404 });

  try {
    const reply = await groqChat(
      [
        {
          role: "system",
          content:
            "Scrivi un solo slogan pubblicitario breve e accattivante in italiano (massimo 10 parole) per il banner promozionale di un ritiro yoga. Tono caldo, evocativo, mai esagerato o clickbait. Rispondi SOLO con lo slogan, senza virgolette, senza spiegazioni.",
        },
        {
          role: "user",
          content: `Titolo del ritiro: "${retreat.title}". Categoria: ${retreat.category}. Luogo: ${retreat.location}. Descrizione breve: ${retreat.excerpt}`,
        },
      ],
      60
    );
    const tagline = reply.replace(/^["“]|["”]$/g, "").trim();
    return NextResponse.json({ tagline });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Errore." }, { status: 500 });
  }
}
