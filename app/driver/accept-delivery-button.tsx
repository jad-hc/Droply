"use client";

import { useTransition } from "react";

import { acceptDelivery } from "./actions";

export function AcceptDeliveryButton({
  orderId,
}: {
  orderId: string;
}) {
  const [isPending, startTransition] =
    useTransition();

  function handleAccept() {
    startTransition(async () => {
      try {
        await acceptDelivery(
          orderId
        );
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Unable to accept delivery."
        );
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleAccept}
      className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
    >
      {isPending
        ? "Accepting..."
        : "Accept Delivery"}
    </button>
  );
}