"use client";

import { useActionState } from "react";

import {
  applyAsDriver,
  DriverApplicationState,
} from "./actions";

const initialState: DriverApplicationState = {
  success: false,
};

export function DriverApplicationForm() {
  const [state, formAction, isPending] =
    useActionState(
      applyAsDriver,
      initialState
    );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border p-6"
    >
      <div>
        <label className="text-sm font-medium">
          Vehicle type
        </label>

        <select
          name="vehicleType"
          className="mt-2 w-full rounded-md border px-3 py-2"
          defaultValue=""
        >
          <option value="">
            Select vehicle
          </option>

          <option value="Motorcycle">
            Motorcycle
          </option>

          <option value="Car">
            Car
          </option>

          <option value="Bicycle">
            Bicycle
          </option>
        </select>

        {state.errors?.vehicleType && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.vehicleType[0]}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">
          Vehicle model
        </label>

        <input
          name="vehicleModel"
          placeholder="Honda PCX 160"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Plate number
        </label>

        <input
          name="vehiclePlate"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Driving license number
        </label>

        <input
          name="licenseNumber"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      {state.message && (
        <p className="text-sm text-red-500">
          {state.message}
        </p>
      )}

      <button
        disabled={isPending}
        className="w-full rounded-md bg-foreground px-5 py-3 text-background disabled:opacity-50"
      >
        {isPending
          ? "Submitting..."
          : "Submit Application"}
      </button>
    </form>
  );
}