import Link from "next/link";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { getCurrentAccount } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LEVELS, levelLabel } from "@/lib/levels";
import CompleteProfileForm from "@/components/site/CompleteProfileForm";

export const metadata = { title: "Il mio account" };

export default async function AccountPage() {
  const account = await getCurrentAccount();
  if (!account) return null;

  const [progresses, leads] = await Promise.all([
    prisma.courseProgress.findMany({ where: { accountId: account.id } }),
    prisma.contactLead.findMany({
      where: { email: account.email },
      include: { retreat: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const courseIds = progresses.map((p) => p.courseId);
  const courses = courseIds.length
    ? await prisma.course.findMany({ where: { id: { in: courseIds } } })
    : [];
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const nextLevel = LEVELS.find((l) => l.value === account.level + 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft-sm sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Il mio account</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground">{account.name}</h1>
          <p className="mt-1 text-sm text-foreground/60">{account.email}</p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <span className="badge-level">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Livello {levelLabel(account.level)}
          </span>
          {nextLevel && (
            <p className="text-xs text-foreground/50">
              Prossimo livello: {nextLevel.label} — {nextLevel.description}
            </p>
          )}
          <Link href="/account/preferiti" className="mt-1 cursor-pointer text-xs font-semibold text-primary">
            Vedi i miei preferiti →
          </Link>
        </div>
      </div>

      {!account.phone && (
        <div className="mt-6">
          <CompleteProfileForm />
        </div>
      )}

      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-foreground">I tuoi corsi</h2>
        {progresses.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">
            Non hai ancora iniziato nessun corso.{" "}
            <Link href="/corsi" className="cursor-pointer font-semibold text-primary">
              Esplora la libreria dei corsi
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {progresses.map((p) => {
              const course = courseById.get(p.courseId);
              if (!course) return null;
              return (
                <Link
                  key={p.id}
                  href={`/corsi/${course.slug}`}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary"
                >
                  <span className="text-sm font-medium text-foreground">{course.title}</span>
                  {p.completed ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Completato
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-foreground/50">
                      <Circle className="h-4 w-4" aria-hidden="true" />
                      In corso
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-foreground">Le tue richieste</h2>
        {leads.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">
            Non hai ancora inviato richieste per nessun ritiro.{" "}
            <Link href="/ritiri" className="cursor-pointer font-semibold text-primary">
              Scopri i ritiri
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {leads.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{l.retreat?.title ?? "Richiesta generale"}</p>
                <p className="mt-1 text-xs text-foreground/60">
                  {new Date(l.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
