-- CreateEnum
CREATE TYPE "RestaurantApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "approvalStatus" "RestaurantApprovalStatus" NOT NULL DEFAULT 'PENDING';
