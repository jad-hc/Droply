"use client";

import { useActionState } from "react";
import {
  createRestaurantAction,
  RestaurantActionState,
} from "./actions";

const initialState: RestaurantActionState = {
  success: false,
};

export function RestaurantForm() {
  const [state, formAction, isPending] = useActionState(
    createRestaurantAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Restaurant name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          className="w-full rounded-md border px-3 py-2"
          placeholder="Burger House"
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
          rows={4}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Tell customers about your restaurant..."
        />

        {state.errors?.description && (
          <p className="text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
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
          type="text"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.phone && (
          <p className="text-sm text-red-500">
            {state.errors.phone[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium"
        >
          Restaurant email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.email && (
          <p className="text-sm text-red-500">
            {state.errors.email[0]}
          </p>
        )}
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
          type="text"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.address && (
          <p className="text-sm text-red-500">
            {state.errors.address[0]}
          </p>
        )}
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
            type="text"
            className="w-full rounded-md border px-3 py-2"
          />

          {state.errors?.city && (
            <p className="text-sm text-red-500">
              {state.errors.city[0]}
            </p>
          )}
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
            type="text"
            className="w-full rounded-md border px-3 py-2"
          />

          {state.errors?.area && (
            <p className="text-sm text-red-500">
              {state.errors.area[0]}
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <p className="text-sm text-red-500">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-foreground px-4 py-3 font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Creating restaurant..."
          : "Create restaurant"}
      </button>
    </form>
  );
}