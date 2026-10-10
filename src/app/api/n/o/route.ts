import { prisma } from "@/lib/prisma";

// Immagine trasparente 1x1 inclusa in fondo alla newsletter: quando il client email la carica,
// si registra l'apertura. Dato indicativo: alcuni client (Apple Mail) la caricano in anticipo
// anche se la persona non apre l'email, altri bloccano le immagini.
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(request: Request) {
  const recipientId = new URL(request.url).searchParams.get("r");
  if (recipientId) {
    try {
      await prisma.emailCampaignRecipient.updateMany({
        where: { id: recipientId, openedAt: null },
        data: { openedAt: new Date() },
      });
    } catch {
      // le statistiche non devono mai impedire di mostrare l'email
    }
  }
  return new Response(PIXEL, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" },
  });
}
