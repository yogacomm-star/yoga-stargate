import Link from "next/link";
import { Compass, GraduationCap, Newspaper, Users, Mail, MessageSquare, Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewModerationActions from "@/components/admin/ReviewModerationActions";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [
    retreatsTotal,
    retreatsPublished,
    coursesTotal,
    coursesPublished,
    postsTotal,
    postsPublished,
    membersTotal,
    membersByLevel,
    leadsTotal,
    consentingTotal,
    pendingReviews,
  ] = await Promise.all([
    prisma.retreat.count(),
    prisma.retreat.count({ where: { status: "PUBLISHED" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.account.count({ where: { role: "MEMBER" } }),
    prisma.account.groupBy({ by: ["level"], where: { role: "MEMBER" }, _count: true }),
    prisma.contactLead.count(),
    prisma.account.count({ where: { role: "MEMBER", marketingConsent: true } }),
    prisma.review.count({ where: { status: "PENDING" } }),
  ]);

  const levelCounts = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
  for (const g of membersByLevel) levelCounts[g.level] = g._count;

  const pendingReviewsList = await prisma.review.findMany({
    where: { status: "PENDING" },
    include: { account: true },
    orderBy: { createdAt: "asc" },
    take: 10,
  });
  const retreatTitles = await prisma.retreat.findMany({
    where: { id: { in: pendingReviewsList.filter((r) => r.targetType === "RETREAT").map((r) => r.targetId) } },
  });
  const courseTitles = await prisma.course.findMany({
    where: { id: { in: pendingReviewsList.filter((r) => r.targetType === "COURSE").map((r) => r.targetId) } },
  });
  const titleFor = (targetType: string, targetId: string) =>
    targetType === "RETREAT"
      ? retreatTitles.find((r) => r.id === targetId)?.title
      : courseTitles.find((c) => c.id === targetId)?.title;

  const stats = [
    { label: "Ritiri", value: retreatsTotal, hint: `${retreatsPublished} pubblicati`, icon: Compass, href: "/admin/ritiri" },
    { label: "Corsi", value: coursesTotal, hint: `${coursesPublished} pubblicati`, icon: GraduationCap, href: "/admin/corsi" },
    { label: "Articoli blog", value: postsTotal, hint: `${postsPublished} pubblicati`, icon: Newspaper, href: "/admin/blog" },
    { label: "Membri", value: membersTotal, hint: `Base ${levelCounts[1]} · Interm. ${levelCounts[2]} · Avanz. ${levelCounts[3]}`, icon: Users, href: "/admin/utenti" },
    { label: "Richieste ricevute", value: leadsTotal, hint: "Lead da ritiri e contatti", icon: MessageSquare, href: "/admin/utenti" },
    { label: "Consenso email", value: consentingTotal, hint: pendingReviews > 0 ? `${pendingReviews} recensioni da moderare` : "Tutto moderato", icon: Mail, href: "/admin/utenti" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Ciao, {admin?.name}</h1>
      <p className="mt-1 text-sm text-foreground/60">Da qui puoi gestire ritiri, corsi, blog e utenti del sito.</p>

      <div data-tour="admin-stats" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft-sm transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-2xl font-semibold text-foreground">{s.value}</span>
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">{s.label}</p>
              <p className="mt-0.5 text-xs text-foreground/60">{s.hint}</p>
            </div>
          </Link>
        ))}
      </div>

      {pendingReviewsList.length > 0 && (
        <div data-tour="admin-reviews" className="mt-10">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
            <Star className="h-5 w-5 text-primary" aria-hidden="true" />
            Recensioni da moderare ({pendingReviewsList.length})
          </h2>
          <div className="mt-4 space-y-3">
            {pendingReviewsList.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {r.account.name} · {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                  <p className="text-xs text-foreground/50">{titleFor(r.targetType, r.targetId) ?? "Contenuto rimosso"}</p>
                  <p className="mt-1 text-sm text-foreground/70">{r.comment}</p>
                </div>
                <ReviewModerationActions reviewId={r.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
