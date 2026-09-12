-- CreateEnum
CREATE TYPE "DriverApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "approvalStatus" "DriverApprovalStatus" NOT NULL DEFAULT 'PENDING';
