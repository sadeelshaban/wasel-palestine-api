-- Add UNKNOWN to the existing enum if it does not exist
ALTER TYPE "CheckpointStatus" ADD VALUE IF NOT EXISTS 'UNKNOWN';

-- Convert CheckpointStatusHistory.status to use the existing enum
ALTER TABLE "CheckpointStatusHistory"
ALTER COLUMN "status" TYPE "CheckpointStatus"
USING (
  CASE
    WHEN "status"::text = 'OPEN' THEN 'OPEN'::"CheckpointStatus"
    WHEN "status"::text = 'CLOSED' THEN 'CLOSED'::"CheckpointStatus"
    ELSE 'UNKNOWN'::"CheckpointStatus"
  END
);