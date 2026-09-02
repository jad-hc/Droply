"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

type Props = {
  latitude?: number | null;
  longitude?: number | null;

  onChange: (
    latitude: number,
    longitude: number
  ) => void;
};

const defaultPosition = {
  lat: 33.8938,
  lng: 35.5018,
};

// Fix default Leaflet marker icons in Next.js
const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [latitude, longitude],
      16
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}

function MapClickHandler({
  onChange,
}: {
  onChange: (
    latitude: number,
    longitude: number
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: Props) {
  const [isLocating, setIsLocating] =
    useState(false);

  const currentLatitude =
    latitude ?? defaultPosition.lat;

  const currentLongitude =
    longitude ?? defaultPosition.lng;

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange(
          position.coords.latitude,
          position.coords.longitude
        );

        setIsLocating(false);
      },

      (error) => {
        console.error(error);

        alert(
          "Unable to get your location. Please allow location access."
        );

        setIsLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={isLocating}
        className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
      >
        {isLocating
          ? "Getting location..."
          : "Use my current location"}
      </button>

      <p className="text-sm text-muted-foreground">
        Click anywhere on the map to move the delivery marker.
      </p>

      <div className="overflow-hidden rounded-xl border">
        <MapContainer
          center={[
            currentLatitude,
            currentLongitude,
          ]}
          zoom={15}
          scrollWheelZoom
          className="h-[350px] w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={[
              currentLatitude,
              currentLongitude,
            ]}
            icon={markerIcon}
          />

          <MapClickHandler
            onChange={onChange}
          />

          <RecenterMap
            latitude={currentLatitude}
            longitude={currentLongitude}
          />
        </MapContainer>
      </div>

      {latitude != null &&
        longitude != null && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>
              Latitude:{" "}
              {latitude.toFixed(6)}
            </p>

            <p>
              Longitude:{" "}
              {longitude.toFixed(6)}
            </p>
          </div>
        )}
    </div>
  );
}