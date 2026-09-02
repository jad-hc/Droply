"use client";

import { useActionState } from "react";
import { useState } from "react";

import {
  LocationPickerWrapper,
} from "@/components/location-picker-wrapper";

import {
  AddressState,
  createAddress,
} from "./actions";

const initialState: AddressState = {
  success: false,
};



export function AddressForm() {
  const [state, formAction, isPending] =
    useActionState(
      createAddress,
      initialState
    );

    const [latitude, setLatitude] =
  useState<number | null>(
    null
  );

const [longitude, setLongitude] =
  useState<number | null>(
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Add delivery address
        </h2>
      </div>

      <div>
        <label className="text-sm font-medium">
          Label
        </label>

        <input
          name="label"
          placeholder="Home"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Address
        </label>

        <input
          name="addressLine"
          placeholder="Street, road..."
          className="mt-2 w-full rounded-md border px-3 py-2"
        />

        {state.errors?.addressLine && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.addressLine[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            City
          </label>

          <input
            name="city"
            placeholder="Beirut"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Area
          </label>

          <input
            name="area"
            placeholder="Hamra"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">
            Building
          </label>

          <input
            name="building"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Floor
          </label>

          <input
            name="floor"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Apartment
          </label>

          <input
            name="apartment"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">
          Delivery instructions
        </label>

        <textarea
          name="instructions"
          rows={3}
          placeholder="Call when you arrive..."
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
  <label className="text-sm font-medium">
    Delivery location
  </label>

  <div className="mt-3">
    <LocationPickerWrapper
      latitude={latitude}
      longitude={longitude}
      onChange={(
        latitude,
        longitude
      ) => {
        setLatitude(latitude);
        setLongitude(longitude);
      }}
    />
  </div>

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
    <p className="mt-2 text-sm text-red-500">
      Please select your location on the map.
    </p>
  )}
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
        className="rounded-md bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        {isPending
          ? "Adding..."
          : "Add address"}
      </button>
    </form>
  );
}