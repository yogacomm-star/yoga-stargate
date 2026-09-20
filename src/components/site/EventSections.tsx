import type { ComponentType } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { CalendarDays, Compass, Flame, HeartPulse, Leaf, MapPin, Sparkles, Sun, Ticket, Users, Backpack } from "lucide-react";
import { splitIntoSections } from "@/lib/sectionize";
import { markdownComponents } from "@/components/site/MarkdownContent";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

// L'icona di ogni scheda si sceglie dal titolo (chi scrive nel pannello non deve sceglierla):
// "A chi è rivolto" → persone, "Programma" → calendario, "Quota e prenotazione" → biglietto ecc.
// Se il titolo non corrisponde a nulla si ruota su un piccolo set di icone neutre.
const ICON_RULES: [RegExp, IconType][] = [
  [/a chi|rivolt|destinat|per chi|partecipanti/i, Users],
  [/programma|giornat|agenda|orari|calendario|date/i, CalendarDays],
  [/quota|prezz|prenot|costo|iscrizion|invest/i, Ticket],
  [/dove|location|luogo|sede|come arrivare/i, MapPin],
  [/portare|occorrente|abbigliamento|cosa serve/i, Backpack],
  [/impar|vivi|vivrai|esperienz|benefic|include|cosa/i, Sparkles],
];
const FALLBACK_ICONS: IconType[] = [Flame, HeartPulse, Sun, Compass, Leaf];

function iconFor(title: string, index: number): IconType {
  return ICON_RULES.find(([re]) => re.test(title))?.[1] ?? FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-base leading-relaxed text-foreground/80">
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={markdownComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Descrizione di un evento nello stile della pagina Metodo: un'introduzione in evidenza e poi
 * le schede in griglia a due colonne (numero, icona, titolo scelto da Tina, testo), non più
 * impilate una sotto l'altra. Una scheda molto lunga o l'ultima rimasta da sola occupa tutta
 * la larghezza, così la griglia non lascia mai buchi.
 */
export default function EventSections({ content, lead }: { content: string; lead: string }) {
  const sections = splitIntoSections(content);
  const intro = sections[0]?.heading === null ? sections[0] : null;
  const cards = sections.filter((s) => s.heading);

  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-lg leading-relaxed text-foreground/80 [&_p]:mt-3 [&_p:first-child]:mt-0">
          <ReactMarkdown remarkPlugins={[remarkBreaks]} components={markdownComponents}>
            {intro?.body || lead}
          </ReactMarkdown>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {cards.map((section, i) => {
            const Icon = iconFor(section.heading ?? "", i);
            const long = section.body.length > 650;
            const alone = cards.length % 2 === 1 && i === cards.length - 1;
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft-sm ${
                  long || alone ? "sm:col-span-2" : ""
                }`}
              >
                <span className="font-heading text-5xl font-semibold text-primary/10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="absolute top-7 right-7 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">{section.heading}</h2>
                {section.body && (
                  <div className="mt-3">
                    <Markdown>{section.body}</Markdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
