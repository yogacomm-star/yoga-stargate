import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/lib/images";

export const runtime = "nodejs";

function formatRange(start: Date | null, end: Date | null) {
  if (!start) return null;
  const fmt = (d: Date) => d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  if (end && end.getTime() !== start.getTime()) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const tagline = url.searchParams.get("tagline") || "";

  const retreat = await prisma.retreat.findUnique({ where: { id } });
  if (!retreat) return new Response("Non trovato", { status: 404 });

  const image = firstImage(retreat.images);
  const absoluteImage = image ? `${url.origin}${image}` : null;
  const dateLabel = formatRange(retreat.startDate, retreat.endDate);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          backgroundColor: "#0c4a6e",
          ...(absoluteImage ? {} : { backgroundImage: "linear-gradient(135deg, #0284c7, #0c4a6e)" }),
          fontFamily: "sans-serif",
        }}
      >
        {absoluteImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={absoluteImage}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, width: "1200px", height: "630px", objectFit: "cover", objectPosition: "top" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(12,74,110,0.15) 0%, rgba(12,74,110,0.92) 78%)",
            display: "flex",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "64px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#7dd3fc",
              fontSize: 26,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {retreat.category}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 62,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: "1000px",
            }}
          >
            {retreat.title}
          </div>
          {tagline && (
            <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#f0f9ff", maxWidth: "980px" }}>
              {tagline}
            </div>
          )}
          <div style={{ display: "flex", gap: 28, marginTop: 32, fontSize: 26, color: "#e0f2fe" }}>
            <div style={{ display: "flex" }}>{retreat.location}</div>
            {dateLabel && <div style={{ display: "flex" }}>· {dateLabel}</div>}
            {retreat.price != null && <div style={{ display: "flex" }}>· da €{retreat.price}</div>}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 24,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "1px",
            }}
          >
            YOGA STARGATE
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
