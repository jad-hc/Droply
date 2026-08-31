"use client";

import { useTransition } from "react";

import { updateRestaurantOrderStatus } from "./actions";

type Props = {
  restaurantId: string;
  orderId: string;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "RESTAURANT_ACCEPTED"
    | "PREPARING"
    | "READY_FOR_PICKUP"
    | "DRIVER_ASSIGNED"
    | "PICKED_UP"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED";
};

export function OrderStatusControls({
  restaurantId,
  orderId,
  status,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  function updateStatus(
    newStatus: string
  ) {
    startTransition(async () => {
      try {
        await updateRestaurantOrderStatus(
          restaurantId,
          orderId,
          newStatus
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Unable to update order."
        );
      }
    });
  }

  if (status === "PENDING") {
    return (
      <div className="flex gap-3">
        <button
          disabled={isPending}
          onClick={() =>
            updateStatus(
              "RESTAURANT_ACCEPTED"
            )
          }
          className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          Accept Order
        </button>

        <button
          disabled={isPending}
          onClick={() =>
            updateStatus("CANCELLED")
          }
          className="rounded-md border px-4 py-2 text-red-500 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    );
  }

  if (
    status ===
    "RESTAURANT_ACCEPTED"
  ) {
    return (
      <button
        disabled={isPending}
        onClick={() =>
          updateStatus("PREPARING")
        }
        className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
      >
        Start Preparing
      </button>
    );
  }

  if (status === "PREPARING") {
    return (
      <button
        disabled={isPending}
        onClick={() =>
          updateStatus(
            "READY_FOR_PICKUP"
          )
        }
        className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
      >
        Ready for Pickup
      </button>
    );
  }

  if (
    status ===
    "READY_FOR_PICKUP"
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        Waiting for a driver.
      </p>
    );
  }

  return null;
}