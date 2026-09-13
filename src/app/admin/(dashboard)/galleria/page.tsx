import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import GalleryUploadForm from "@/components/admin/GalleryUploadForm";
import GalleryReorderButtons from "@/components/admin/GalleryReorderButtons";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminGalleriaPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Gallery</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Foto e video mostrati sulla pagina pubblica{" "}
          <a href="/galleria" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            /galleria
          </a>
          . Aggiunti qui, appaiono subito sul sito — non serve pubblicarli separatamente. I video sono link a
          YouTube o Vimeo, non file caricati: così restano leggeri e non pesano sullo spazio di archiviazione.
        </p>
      </div>

      <GalleryUploadForm />

      {items.length === 0 ? (
        <p className="text-sm text-foreground/50">Nessuna foto o video ancora. Aggiungine uno qui sopra.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative h-40 w-full bg-muted">
                {item.type === "IMAGE" && item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="360px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-foreground/50">
                    <PlayCircle className="h-8 w-8" aria-hidden="true" />
                    <span className="text-xs">Video</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground/80">{item.caption || "—"}</p>
                  {item.type === "VIDEO" && item.videoUrl && (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-primary hover:underline"
                    >
                      {item.videoUrl}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <GalleryReorderButtons id={item.id} isFirst={i === 0} isLast={i === items.length - 1} />
                  <DeleteButton endpoint={`/api/admin/gallery/${item.id}`} confirmLabel="Eliminare questo elemento dalla Gallery?" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
