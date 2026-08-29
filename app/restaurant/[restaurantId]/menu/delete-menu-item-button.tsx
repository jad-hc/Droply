"use client";

import { useTransition } from "react";

import { deleteMenuItem } from "./actions";

type Props = {
  restaurantId: string;
  itemId: string;
};

export function DeleteMenuItemButton({
  restaurantId,
  itemId,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    if (
      !window.confirm(
        "Delete this menu item?"
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteMenuItem(
        restaurantId,
        itemId
      );
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 disabled:opacity-50"
    >
      {isPending
        ? "Deleting..."
        : "Delete"}
    </button>
  );
}