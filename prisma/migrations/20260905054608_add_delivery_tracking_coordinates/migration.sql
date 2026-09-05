-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "locationUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryLatitude" DOUBLE PRECISION,
ADD COLUMN     "deliveryLongitude" DOUBLE PRECISION;
