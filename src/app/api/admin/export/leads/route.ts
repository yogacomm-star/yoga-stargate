import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return new Response("Non autorizzato.", { status: 401 });

  const leads = await prisma.contactLead.findMany({
    include: { retreat: true },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["Nome", "Email", "Telefono", "Ritiro", "Dimensione gruppo", "Messaggio", "Data"],
    leads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.retreat?.title ?? "",
      l.groupSize ?? "",
      l.message,
      l.createdAt.toISOString(),
    ])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lead-yoga-stargate.csv"`,
    },
  });
}
