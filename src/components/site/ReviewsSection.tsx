import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/site/ReviewForm";

export default async function ReviewsSection({
  targetType,
  targetId,
  account,
  unlocked,
}: {
  targetType: "RETREAT" | "COURSE";
  targetId: string;
  account: { id: string } | null;
  unlocked: boolean;
}) {
  const reviews = await prisma.review.findMany({
    where: { targetType, targetId, status: "APPROVED" },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Recensioni {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">Nessuna recensione ancora. Sii la prima o il primo a lasciarne una.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{r.account.name}</p>
                <div className="flex items-center gap-0.5 text-primary">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" fill={i < r.rating ? "currentColor" : "none"} aria-hidden="true" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-foreground/70">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {account && unlocked && (
        <div className="mt-6">
          <ReviewForm targetType={targetType} targetId={targetId} />
        </div>
      )}
    </div>
  );
}
