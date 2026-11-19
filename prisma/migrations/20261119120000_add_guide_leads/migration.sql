-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "leadGuidePdfUrl" TEXT;

-- CreateTable
CREATE TABLE "GuideLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "ipHash" TEXT,
    "emailStatus" TEXT NOT NULL DEFAULT 'pending',
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuideLead_email_createdAt_idx" ON "GuideLead"("email", "createdAt");

-- CreateIndex
CREATE INDEX "GuideLead_ipHash_createdAt_idx" ON "GuideLead"("ipHash", "createdAt");
