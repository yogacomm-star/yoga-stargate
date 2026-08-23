import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return new Response("Non autorizzato.", { status: 401 });

  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  const csv = toCsv(
    ["Email", "Iscritto il"],
    subs.map((s) => [s.email, s.createdAt.toISOString()])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-yoga-stargate.csv"`,
    },
  });
}
