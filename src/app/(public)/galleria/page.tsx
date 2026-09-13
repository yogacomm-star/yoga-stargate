import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/site/Hero";
import { isAllowedEmbedUrl } from "@/lib/embed";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Foto e video di Yoga Stargate: lezioni, ritiri e viaggi con Tina Mastandrea.",
  alternates: { canonical: "/galleria" },
};

// Griglia auto-adattiva: che ci siano 3 foto o 300, tra foto verticali, orizzontali e video,
// ogni riquadro resta un quadrato uniforme (aspect-square + object-cover) e la griglia si
// riempie da sola col numero di colonne che ci sta, senza bisogno di toccare il layout quando
// Tina aggiunge o toglie contenuti dal pannello.
export default async function GalleriaPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

  return (
    <>
      <Hero
        eyebrow="Gallery"
        title="Momenti di Yoga Stargate"
        subtitle="Lezioni, ritiri e viaggi: qualche scatto e qualche video da chi ha già iniziato il suo percorso."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {items.length === 0 ? (
          <p className="text-center text-sm text-foreground/60">
            La gallery è in preparazione: torna presto a dare un&apos;occhiata.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <figure key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-muted">
                {item.type === "IMAGE" && item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.caption ?? ""}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : item.type === "VIDEO" && item.videoUrl && isAllowedEmbedUrl(item.videoUrl) ? (
                  <iframe
                    src={item.videoUrl}
                    title={item.caption ?? "Video"}
                    className="h-full w-full"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : null}
                {item.caption && (
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
