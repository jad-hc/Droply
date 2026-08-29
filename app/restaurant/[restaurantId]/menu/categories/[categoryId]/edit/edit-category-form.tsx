"use client";

import { useActionState } from "react";

import {
  updateMenuCategory,
  MenuCategoryState,
} from "../../../actions";

type Props = {
  restaurantId: string;
  category: {
    id: string;
    name: string;
    description: string | null;
    sortOrder: number;
  };
};

const initialState: MenuCategoryState = {
  success: false,
};

export function EditCategoryForm({
  restaurantId,
  category,
}: Props) {
  const action = updateMenuCategory.bind(
    null,
    restaurantId,
    category.id
  );

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input
        name="name"
        defaultValue={category.name}
        className="w-full rounded-md border px-3 py-2"
      />

      <textarea
        name="description"
        defaultValue={category.description ?? ""}
        className="w-full rounded-md border px-3 py-2"
      />

      <input
        name="sortOrder"
        type="number"
        defaultValue={category.sortOrder}
        className="w-full rounded-md border px-3 py-2"
      />

      {state.message && (
        <p className="text-sm">
          {state.message}
        </p>
      )}

      <button
        disabled={isPending}
        className="rounded-md bg-foreground px-4 py-2 text-background"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}