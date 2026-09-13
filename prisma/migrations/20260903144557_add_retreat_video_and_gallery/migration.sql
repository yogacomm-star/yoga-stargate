-- AlterTable
ALTER TABLE "Retreat" ADD COLUMN "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageKey" TEXT,
    "videoUrl" TEXT,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
