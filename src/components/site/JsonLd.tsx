// Serializza in JSON-LD evitando che sequenze come "</script>" nei dati (es. titoli)
// possano interrompere prematuramente il tag <script> e iniettare HTML/JS.
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}
