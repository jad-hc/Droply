const EARTH_RADIUS_KM = 6371;

function degreesToRadians(
  degrees: number
) {
  return (
    degrees *
    (Math.PI / 180)
  );
}

export function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const latitudeDifference =
    degreesToRadians(
      latitude2 - latitude1
    );

  const longitudeDifference =
    degreesToRadians(
      longitude2 - longitude1
    );

  const lat1 =
    degreesToRadians(
      latitude1
    );

  const lat2 =
    degreesToRadians(
      latitude2
    );

  const a =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(
        longitudeDifference / 2
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return (
    EARTH_RADIUS_KM *
    c
  );
}