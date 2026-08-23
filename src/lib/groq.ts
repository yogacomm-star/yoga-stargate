const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

export function groqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function groqChat(messages: ChatMessage[], maxTokens = 500): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY non configurata.");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.6,
      // gpt-oss-120b è un modello "reasoning": senza limitare lo sforzo di ragionamento,
      // può consumare l'intero budget di token pensando e restituire una risposta vuota.
      reasoning_effort: "low",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
