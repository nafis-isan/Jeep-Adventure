-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'FACILITATOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';
