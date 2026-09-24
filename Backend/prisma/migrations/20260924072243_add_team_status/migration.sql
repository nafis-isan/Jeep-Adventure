-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "status" "TeamStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "Team" SET "status" = 'APPROVED';
