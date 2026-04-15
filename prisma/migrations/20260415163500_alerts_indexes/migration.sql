-- Subscription query performance indexes
CREATE INDEX IF NOT EXISTS "Subscription_latitude_longitude_idx"
ON "Subscription"("latitude", "longitude");

CREATE INDEX IF NOT EXISTS "Subscription_userId_category_idx"
ON "Subscription"("userId", "category");

-- Alert feed/read performance index
CREATE INDEX IF NOT EXISTS "Alert_userId_isRead_createdAt_idx"
ON "Alert"("userId", "isRead", "createdAt");
