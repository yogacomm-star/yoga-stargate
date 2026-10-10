import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const STATUS_LABEL: Record<string, string> = { SENT: "Inviata", FAILED: "Non riuscita", PENDING: "In attesa" };

function csvCell(value: string): string {
  // Le celle che iniziano con = + - @ verrebbero interpretate come formule da Excel: si neutralizzano.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

const fmt = (d: Date | null) => (d ? d.toISOString().replace("T", " ").slice(0, 16) : "");

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Campagna non trovata." }, { status: 404 });

  const recipients = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId: id },
    orderBy: [{ status: "asc" }, { email: "asc" }],
  });

  const rows = [
    ["Nome", "Email", "Esito", "Inviata il", "Aperta", "Cliccato", "Disiscritta/o", "Dettaglio errore"],
    ...recipients.map((r) => [
      r.name,
      r.email,
      STATUS_LABEL[r.status] ?? r.status,
      fmt(r.sentAt),
      r.openedAt ? "sì" : "",
      r.clickedAt ? "sì" : "",
      r.unsubscribedAt ? "sì" : "",
      r.error ?? "",
    ]),
  ];
  const csv = "﻿" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
