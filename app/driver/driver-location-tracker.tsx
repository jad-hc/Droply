"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  orderId: string;
};

export function DriverLocationTracker({
  orderId,
}: Props) {
  const [
    tracking,
    setTracking,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    lastUpdate,
    setLastUpdate,
  ] = useState<Date | null>(
    null
  );

  const watchId =
    useRef<number | null>(
      null
    );

  const lastSentAt =
    useRef(0);

  async function sendLocation(
    latitude: number,
    longitude: number,
    accuracy: number
  ) {
    try {
      const response =
        await fetch(
          "/api/driver/location",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              orderId,
              latitude,
              longitude,
              accuracy,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Unable to update location."
        );
      }

      setLastUpdate(
        new Date()
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update location."
      );
    }
  }

  function startTracking() {
    setError("");

    if (
      !navigator.geolocation
    ) {
      setError(
        "Geolocation is not supported on this device."
      );

      return;
    }

    if (
      watchId.current !==
      null
    ) {
      return;
    }

    const id =
      navigator.geolocation.watchPosition(
        (position) => {
          setTracking(true);

          const now =
            Date.now();

          // Don't hit our API more
          // than once every 5 seconds.
          if (
            now -
              lastSentAt.current <
            5000
          ) {
            return;
          }

          lastSentAt.current =
            now;

          void sendLocation(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },

        (geoError) => {
          console.error(
            geoError
          );

          setTracking(false);

          switch (
            geoError.code
          ) {
            case 1:
              setError(
                "Location permission was denied."
              );
              break;

            case 2:
              setError(
                "Your location is currently unavailable."
              );
              break;

            case 3:
              setError(
                "Location request timed out."
              );
              break;

            default:
              setError(
                "Unable to get your location."
              );
          }
        },

        {
          enableHighAccuracy:
            true,

          maximumAge:
            5000,

          timeout:
            15000,
        }
      );

    watchId.current =
      id;

    setTracking(true);
  }

  function stopTracking() {
    if (
      watchId.current !== null
    ) {
      navigator.geolocation.clearWatch(
        watchId.current
      );

      watchId.current =
        null;
    }

    setTracking(false);
  }

  useEffect(() => {
    return () => {
      if (
        watchId.current !==
        null
      ) {
        navigator.geolocation.clearWatch(
          watchId.current
        );
      }
    };
  }, []);

  return (
    <div className="rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">
            Live Location
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Share your location while
            completing this delivery.
          </p>
        </div>

        {tracking ? (
          <button
            type="button"
            onClick={
              stopTracking
            }
            className="rounded-md border px-4 py-2 text-sm"
          >
            Stop Sharing
          </button>
        ) : (
          <button
            type="button"
            onClick={
              startTracking
            }
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            Start Live Location
          </button>
        )}
      </div>

      <div className="mt-3 text-sm">
        {tracking ? (
          <span className="text-green-600">
            ● Location sharing
            active
          </span>
        ) : (
          <span className="text-muted-foreground">
            Location sharing
            inactive
          </span>
        )}
      </div>

      {lastUpdate && (
        <p className="mt-1 text-xs text-muted-foreground">
          Last update:{" "}
          {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}