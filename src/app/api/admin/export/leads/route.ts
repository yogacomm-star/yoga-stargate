import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { LEAD_SOURCES } from "@/lib/leadSources";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return new Response("Non autorizzato.", { status: 401 });

  const source = new URL(request.url).searchParams.get("source");
  const activeSource = source && (LEAD_SOURCES as readonly string[]).includes(source) ? source : undefined;

  const leads = await prisma.contactLead.findMany({
    where: activeSource ? { source: activeSource } : undefined,
    include: { retreat: true },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["Nome", "Email", "Telefono", "Categoria", "Ritiro", "Dimensione gruppo", "Messaggio", "Data"],
    leads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.source,
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
