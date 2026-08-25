-- CreateTable
CREATE TABLE "CoursePurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "stripeCheckoutSession" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoursePurchase_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CoursePurchase_stripeCheckoutSession_key" ON "CoursePurchase"("stripeCheckoutSession");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePurchase_accountId_courseId_key" ON "CoursePurchase"("accountId", "courseId");
