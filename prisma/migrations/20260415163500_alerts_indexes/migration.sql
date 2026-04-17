CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "radiusMeters" INTEGER NOT NULL DEFAULT 1000,
  "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Alert" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Alert_userId_incidentId_key" ON "Alert"("userId", "incidentId");

CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_latitude_longitude_idx" ON "Subscription"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Subscription_userId_category_idx" ON "Subscription"("userId", "category");
CREATE INDEX IF NOT EXISTS "Subscription_category_idx" ON "Subscription"("category");
CREATE INDEX IF NOT EXISTS "Subscription_createdAt_idx" ON "Subscription"("createdAt");

CREATE INDEX IF NOT EXISTS "Alert_userId_createdAt_idx" ON "Alert"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Alert_userId_isRead_createdAt_idx" ON "Alert"("userId", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "Alert_incidentId_idx" ON "Alert"("incidentId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Subscription_userId_fkey'
  ) THEN
    ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Alert_userId_fkey'
  ) THEN
    ALTER TABLE "Alert"
    ADD CONSTRAINT "Alert_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Alert_incidentId_fkey'
  ) THEN
    ALTER TABLE "Alert"
    ADD CONSTRAINT "Alert_incidentId_fkey"
    FOREIGN KEY ("incidentId") REFERENCES "Incident"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;