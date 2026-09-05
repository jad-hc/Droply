"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  useEffect,
} from "react";

import L from "leaflet";

type Point = {
  latitude: number;
  longitude: number;
};

type Props = {
  restaurant: Point;

  delivery: Point;

  driver?: Point | null;
};

const markerIcon =
  new L.Icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],
  });

function FollowDriver({
  driver,
}: {
  driver?: Point | null;
}) {
  const map =
    useMap();

  useEffect(() => {
    if (!driver) {
      return;
    }

    map.panTo(
      [
        driver.latitude,
        driver.longitude,
      ],
      {
        animate: true,
      }
    );
  }, [
    driver,
    map,
  ]);

  return null;
}

export function DeliveryTrackingMap({
  restaurant,
  delivery,
  driver,
}: Props) {
  return (
    <MapContainer
      center={[
        driver?.latitude ??
          restaurant.latitude,

        driver?.longitude ??
          restaurant.longitude,
      ]}
      zoom={14}
      className="h-[400px] w-full"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[
          restaurant.latitude,
          restaurant.longitude,
        ]}
        icon={markerIcon}
      >
        <Popup>
          Restaurant
        </Popup>
      </Marker>

      <Marker
        position={[
          delivery.latitude,
          delivery.longitude,
        ]}
        icon={markerIcon}
      >
        <Popup>
          Delivery Address
        </Popup>
      </Marker>

      {driver && (
        <Marker
          position={[
            driver.latitude,
            driver.longitude,
          ]}
          icon={markerIcon}
        >
          <Popup>
            Your Driver
          </Popup>
        </Marker>
      )}

      <FollowDriver
        driver={driver}
      />
    </MapContainer>
  );
}