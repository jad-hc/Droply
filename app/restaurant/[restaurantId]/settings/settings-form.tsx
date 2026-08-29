"use client";

import { useActionState } from "react";

import { ImageUpload } from "@/components/restaurant/image-upload";

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