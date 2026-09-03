-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Beirut';

-- CreateTable
CREATE TABLE "RestaurantOpeningHour" (
    "id" TEXT NOT NULL,
    "day" "DayOfWeek" NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TEXT,
    "closeTime" TEXT,
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RestaurantOpeningHour_restaurantId_idx" ON "RestaurantOpeningHour"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOpeningHour_restaurantId_day_key" ON "RestaurantOpeningHour"("restaurantId", "day");

-- AddForeignKey
ALTER TABLE "RestaurantOpeningHour" ADD CONSTRAINT "RestaurantOpeningHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
