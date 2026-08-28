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
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 1,
    "avatar" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Account" ("avatar", "createdAt", "email", "googleId", "id", "level", "marketingConsent", "name", "passwordHash", "phone", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "googleId", "id", "level", "marketingConsent", "name", "passwordHash", "phone", "role", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_googleId_key" ON "Account"("googleId");
CREATE TABLE "new_AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "storageLimitEnabled" BOOLEAN NOT NULL DEFAULT true,
    "storageLimitBytes" BIGINT NOT NULL DEFAULT 9500000000,
    "siteLocked" BOOLEAN NOT NULL DEFAULT false,
    "siteLockCodeHash" TEXT
);
INSERT INTO "new_AppSettings" ("id", "storageLimitBytes", "storageLimitEnabled") SELECT "id", "storageLimitBytes", "storageLimitEnabled" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
