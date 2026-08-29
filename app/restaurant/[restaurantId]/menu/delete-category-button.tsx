"use client";

import { useTransition } from "react";

import { deleteMenuCategory } from "./actions";

type Props = {
  restaurantId: string;
  categoryId: string;
};

export function DeleteCategoryButton({
  restaurantId,
  categoryId,
}: Props) {
  const [isPending, startTransition] =
    useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteMenuCategory(
        restaurantId,
        categoryId
      );
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 disabled:opacity-50 hover:bg-red-50 rounded px-2 py-1 transition"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}