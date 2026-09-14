import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { splitIntoSections } from "@/lib/sectionize";

const markdownComponents = {
  h2: (props: ComponentProps<"h2">) => <h2 className="mt-8 font-heading text-2xl font-semibold text-foreground" {...props} />,
  h3: (props: ComponentProps<"h3">) => <h3 className="mt-6 font-heading text-xl font-semibold text-foreground" {...props} />,
  p: (props: ComponentProps<"p">) => <p {...props} />,
  ul: (props: ComponentProps<"ul">) => <ul className="list-disc space-y-1 pl-5" {...props} />,
  ol: (props: ComponentProps<"ol">) => <ol className="list-decimal space-y-1 pl-5" {...props} />,
  a: (props: ComponentProps<"a">) => <a className="font-medium text-primary underline underline-offset-2" {...props} />,
  strong: (props: ComponentProps<"strong">) => <strong className="font-semibold text-foreground" {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote className="border-l-4 border-primary/40 pl-4 text-foreground/70 italic" {...props} />
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-foreground/80">
      <ReactMarkdown
        // Chi scrive i contenuti dal pannello admin va a capo come farebbe in un editor di
        // testo normale (un Invio = una riga nuova), non con la doppia riga vuota richiesta
        // dal Markdown standard per separare i paragrafi. Senza remark-breaks, react-markdown
        // unirebbe silenziosamente tutte quelle righe in un unico paragrafo continuo.
        remarkPlugins={[remarkBreaks]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Come MarkdownContent, ma per testi "informativi" (descrizione di un ritiro o di un
 * corso) che alternano righe-etichetta brevi ("Cosa portare:", "Quota e prenotazione",
 * "Location") a blocchi di dettagli, senza vere intestazioni Markdown. Individua quelle
 * righe-etichetta e mostra ogni sezione come una scheda separata, invece di lasciare tutto
 * il testo in un unico flusso indistinguibile — lo stesso linguaggio visivo già usato per
 * il programma giorno-per-giorno.
 */
export function SectionedContent({ content }: { content: string }) {
  const sections = splitIntoSections(content);

  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        const body = (
          <ReactMarkdown remarkPlugins={[remarkBreaks]} components={markdownComponents}>
            {section.body}
          </ReactMarkdown>
        );

        if (!section.heading) {
          return (
            <div key={i} className="space-y-4 text-base leading-relaxed text-foreground/80">
              {body}
            </div>
          );
        }

        return (
          <div key={i} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-base leading-relaxed text-foreground/80">{body}</div>
          </div>
        );
      })}
    </div>
  );
}
