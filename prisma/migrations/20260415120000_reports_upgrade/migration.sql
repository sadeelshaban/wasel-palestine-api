-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';

-- AlterTable
ALTER TABLE "Report"
ADD COLUMN IF NOT EXISTS "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Report_latitude_longitude_idx" ON "Report"("latitude", "longitude");
