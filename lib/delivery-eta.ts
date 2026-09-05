import { calculateDistanceKm } from "@/lib/distance";

export function calculateDeliveryEta({
  driverLatitude,
  driverLongitude,
  deliveryLatitude,
  deliveryLongitude,
}: {
  driverLatitude: number;
  driverLongitude: number;
  deliveryLatitude: number;
  deliveryLongitude: number;
}) {
  const distanceKm = calculateDistanceKm(
    driverLatitude,
    driverLongitude,
    deliveryLatitude,
    deliveryLongitude
  );

  // Approximate urban delivery speed.
  const averageSpeedKmH = 25;

  const rawMinutes =
    (distanceKm / averageSpeedKmH) * 60;

  // Add a small buffer for traffic/stops.
  const estimatedMinutes = Math.max(
    1,
    Math.ceil(rawMinutes + 3)
  );

  return {
    distanceKm,
    estimatedMinutes,
  };
}