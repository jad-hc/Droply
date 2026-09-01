"use client";

import { useTransition } from "react";

import { updateDeliveryStatus } from "./actions";

type Props = {
  orderId: string;

  status:
    | "DRIVER_ASSIGNED"
    | "PICKED_UP"
    | "ON_THE_WAY";
};

export function ActiveDeliveryControls({
  orderId,
  status,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  let nextStatus:
    | "PICKED_UP"
    | "ON_THE_WAY"
    | "DELIVERED";

  let label: string;

  if (
    status ===
    "DRIVER_ASSIGNED"
  ) {
    nextStatus =
      "PICKED_UP";

    label =
      "Confirm Pickup";
  } else if (
    status ===
    "PICKED_UP"
  ) {
    nextStatus =
      "ON_THE_WAY";

    label =
      "Start Delivery";
  } else {
    nextStatus =
      "DELIVERED";

    label =
      "Mark Delivered";
  }

  function handleUpdate() {
    startTransition(async () => {
      try {
        await updateDeliveryStatus(
          orderId,
          nextStatus
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Unable to update delivery."
        );
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleUpdate}
      className="rounded-md bg-foreground px-5 py-2 text-background disabled:opacity-50"
    >
      {isPending
        ? "Updating..."
        : label}
    </button>
  );
}