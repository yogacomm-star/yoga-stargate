import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/80">
      <ReactMarkdown
        // Chi scrive i contenuti dal pannello admin va a capo come farebbe in un editor di
        // testo normale (un Invio = una riga nuova), non con la doppia riga vuota richiesta
        // dal Markdown standard per separare i paragrafi. Senza remark-breaks, react-markdown
        // unirebbe silenziosamente tutte quelle righe in un unico paragrafo continuo.
        remarkPlugins={[remarkBreaks]}
        components={{
          h2: (props) => <h2 className="mt-8 font-heading text-2xl font-semibold text-foreground" {...props} />,
          h3: (props) => <h3 className="mt-6 font-heading text-xl font-semibold text-foreground" {...props} />,
          p: (props) => <p {...props} />,
          ul: (props) => <ul className="list-disc space-y-1 pl-5" {...props} />,
          ol: (props) => <ol className="list-decimal space-y-1 pl-5" {...props} />,
          a: (props) => <a className="font-medium text-primary underline underline-offset-2" {...props} />,
          strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
          blockquote: (props) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 text-foreground/70 italic" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
