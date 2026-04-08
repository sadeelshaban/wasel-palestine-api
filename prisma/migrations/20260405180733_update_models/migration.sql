/*
  Warnings:

  - Changed the type of `status` on the `Checkpoint` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `severity` on the `Incident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Incident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CheckpointStatus" AS ENUM ('OPEN', 'CLOSED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'VERIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Checkpoint" DROP COLUMN "status",
ADD COLUMN     "status" "CheckpointStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "severity",
ADD COLUMN     "severity" "IncidentSeverity" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "IncidentStatus" NOT NULL;
