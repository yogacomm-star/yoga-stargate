import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseButtons } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

// Clic su un pulsante della newsletter: si registra e si inoltra alla pagina vera. La
// destinazione NON viene presa dal link (sarebbe un reindirizzamento aperto sfruttabile per
// phishing), ma letta dalla campagna a partire dall'id della persona e dal numero del pulsante.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const recipientId = url.searchParams.get("r") ?? "";
  const buttonNo = url.searchParams.get("b") === "2" ? 2 : 1;
  const fallback = NextResponse.redirect(SITE_URL, 302);

  if (!recipientId) return fallback;

  try {
    const recipient = await prisma.emailCampaignRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: { select: { buttons: true } } },
    });
    if (!recipient) return fallback;

    const target = parseButtons(recipient.campaign.buttons)[buttonNo - 1]?.url;
    if (!target) return fallback;

    const now = new Date();
    await prisma.emailCampaignRecipient.update({
      where: { id: recipient.id },
      data: {
        clickedAt: recipient.clickedAt ?? now,
        ...(buttonNo === 1 ? { clickedButton1: recipient.clickedButton1 ?? now } : { clickedButton2: recipient.clickedButton2 ?? now }),
        // Chi clicca ha sicuramente letto: se l'immagine invisibile era stata bloccata, lo segniamo qui.
        openedAt: recipient.openedAt ?? now,
      },
    });
    return NextResponse.redirect(target, 302);
  } catch {
    return fallback;
  }
}
