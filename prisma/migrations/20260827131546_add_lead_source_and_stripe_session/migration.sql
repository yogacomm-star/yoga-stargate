-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Contatti generali',
    "groupSize" INTEGER,
    "retreatId" TEXT,
    "stripeCheckoutSession" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactLead_retreatId_fkey" FOREIGN KEY ("retreatId") REFERENCES "Retreat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ContactLead" ("createdAt", "email", "groupSize", "id", "message", "name", "phone", "retreatId") SELECT "createdAt", "email", "groupSize", "id", "message", "name", "phone", "retreatId" FROM "ContactLead";
DROP TABLE "ContactLead";
ALTER TABLE "new_ContactLead" RENAME TO "ContactLead";
CREATE UNIQUE INDEX "ContactLead_stripeCheckoutSession_key" ON "ContactLead"("stripeCheckoutSession");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
