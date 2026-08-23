import ReactMarkdown from "react-markdown";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/80">
      <ReactMarkdown
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
