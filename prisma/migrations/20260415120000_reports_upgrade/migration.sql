DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ReportStatus'
  ) THEN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');
  ELSE
    ALTER TYPE "ReportStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'VoteType'
  ) THEN
    CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Vote" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "voteType" "VoteType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Flag" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Report"
ADD COLUMN IF NOT EXISTS "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Report_userId_idx" ON "Report"("userId");
CREATE INDEX IF NOT EXISTS "Report_latitude_longitude_idx" ON "Report"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");
CREATE INDEX IF NOT EXISTS "Report_category_idx" ON "Report"("category");
CREATE INDEX IF NOT EXISTS "Report_createdAt_idx" ON "Report"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "Vote_userId_reportId_key" ON "Vote"("userId", "reportId");
CREATE INDEX IF NOT EXISTS "Vote_reportId_idx" ON "Vote"("reportId");
CREATE INDEX IF NOT EXISTS "Vote_userId_idx" ON "Vote"("userId");

CREATE INDEX IF NOT EXISTS "Flag_reportId_idx" ON "Flag"("reportId");
CREATE INDEX IF NOT EXISTS "Flag_userId_idx" ON "Flag"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Report_userId_fkey'
  ) THEN
    ALTER TABLE "Report"
    ADD CONSTRAINT "Report_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Vote_userId_fkey'
  ) THEN
    ALTER TABLE "Vote"
    ADD CONSTRAINT "Vote_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Vote_reportId_fkey'
  ) THEN
    ALTER TABLE "Vote"
    ADD CONSTRAINT "Vote_reportId_fkey"
    FOREIGN KEY ("reportId") REFERENCES "Report"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Flag_userId_fkey'
  ) THEN
    ALTER TABLE "Flag"
    ADD CONSTRAINT "Flag_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Flag_reportId_fkey'
  ) THEN
    ALTER TABLE "Flag"
    ADD CONSTRAINT "Flag_reportId_fkey"
    FOREIGN KEY ("reportId") REFERENCES "Report"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;