"use client";

import { useActionState } from "react";

import { ImageUpload } from "@/components/restaurant/image-upload";

import { useState } from "react";

import { LocationPickerWrapper } from "@/components/location-picker-wrapper";

import {
  RestaurantSettingsState,
  updateRestaurantSettings,
} from "./actions";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  area: string | null;
  logo: string | null;
  coverImage: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryRadiusKm: number;
  baseDeliveryFee: number;
  deliveryFeePerKm: number;
  minimumOrder: number;
};

const initialState: RestaurantSettingsState = {
  success: false,
};

export function SettingsForm({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const action =
    updateRestaurantSettings.bind(
      null,
      restaurant.id
    );

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  const [latitude, setLatitude] =
  useState<number | null>(
    restaurant.latitude ?? null
  );

  const [longitude, setLongitude] =
  useState<number | null>(
    restaurant.longitude ?? null
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
    <ImageUpload
        name="logo"
        label="Restaurant logo"
        restaurantId={restaurant.id}
        folder="logo"
        initialValue={restaurant.logo}
    />

    <ImageUpload
        name="coverImage"
        label="Cover image"
        restaurantId={restaurant.id}
        folder="cover"
        initialValue={restaurant.coverImage}
    />

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Name
        </label>

        <input
          id="name"
          name="name"
          defaultValue={restaurant.name}
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.name && (
          <p className="text-sm text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          defaultValue={
            restaurant.description ?? ""
          }
          rows={4}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="text-sm font-medium"
        >
          Phone
        </label>

        <input
          id="phone"
          name="phone"
          defaultValue={restaurant.phone ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          defaultValue={restaurant.email ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="address"
          className="text-sm font-medium"
        >
          Address
        </label>

        <input
          id="address"
          name="address"
          defaultValue={
            restaurant.address ?? ""
          }
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="city"
            className="text-sm font-medium"
          >
            City
          </label>

          <input
            id="city"
            name="city"
            defaultValue={
              restaurant.city ?? ""
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="area"
            className="text-sm font-medium"
          >
            Area
          </label>

          <input
            id="area"
            name="area"
            defaultValue={
              restaurant.area ?? ""
            }
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-3">
  <div>
    <h2 className="font-medium">
      Restaurant Location
    </h2>

    <p className="text-sm text-muted-foreground">
      Select the exact restaurant location for delivery calculations.
    </p>
  </div>

  <LocationPickerWrapper
    latitude={latitude}
    longitude={longitude}
    onChange={(
      newLatitude,
      newLongitude
    ) => {
      setLatitude(newLatitude);
      setLongitude(newLongitude);
    }}
  />

  <input
    type="hidden"
    name="latitude"
    value={latitude ?? ""}
  />

  <input
    type="hidden"
    name="longitude"
    value={longitude ?? ""}
  />

  {state.errors?.latitude && (
    <p className="text-sm text-red-500">
      Please select the restaurant location.
    </p>
  )}

  {state.errors?.longitude && (
    <p className="text-sm text-red-500">
      Please select the restaurant location.
    </p>
  )}
</div>

<div className="rounded-xl border p-5">
  <h2 className="text-lg font-semibold">
    Delivery Settings
  </h2>

  <div className="mt-5 grid gap-4 md:grid-cols-2">
    <div>
      <label className="text-sm font-medium">
        Delivery radius (km)
      </label>

      <input
        type="number"
        name="deliveryRadiusKm"
        step="0.1"
        min="0"
        defaultValue={
          restaurant.deliveryRadiusKm
        }
        className="mt-2 w-full rounded-md border px-3 py-2"
      />
    </div>

    <div>
      <label className="text-sm font-medium">
        Minimum order ($)
      </label>

      <input
        type="number"
        name="minimumOrder"
        step="0.01"
        min="0"
        defaultValue={
          restaurant.minimumOrder
        }
        className="mt-2 w-full rounded-md border px-3 py-2"
      />
    </div>

    <div>
      <label className="text-sm font-medium">
        Base delivery fee ($)
      </label>

      <input
        type="number"
        name="baseDeliveryFee"
        step="0.01"
        min="0"
        defaultValue={
          restaurant.baseDeliveryFee
        }
        className="mt-2 w-full rounded-md border px-3 py-2"
      />
    </div>

    <div>
      <label className="text-sm font-medium">
        Additional fee per km ($)
      </label>

      <input
        type="number"
        name="deliveryFeePerKm"
        step="0.01"
        min="0"
        defaultValue={
          restaurant.deliveryFeePerKm
        }
        className="mt-2 w-full rounded-md border px-3 py-2"
      />
    </div>
  </div>
</div>

      {state.message && (
        <p
          className={
            state.success
              ? "text-sm text-green-600"
              : "text-sm text-red-500"
          }
        >
          {state.message}
        </p>
      )}

      <button
        disabled={isPending}
        type="submit"
        className="rounded-md bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Save settings"}
      </button>
    </form>
  );
}