/*
  Warnings:

  - You are about to drop the `NewsletterSubscriber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "NewsletterSubscriber_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NewsletterSubscriber";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "level" INTEGER NOT NULL DEFAULT 1,
    "avatar" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Account" ("avatar", "createdAt", "email", "googleId", "id", "level", "name", "passwordHash", "phone", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "googleId", "id", "level", "name", "passwordHash", "phone", "role", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_googleId_key" ON "Account"("googleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
