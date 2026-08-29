"use client";

import { useActionState } from "react";

import {
  createMenuCategory,
  MenuCategoryState,
} from "./actions";

const initialState: MenuCategoryState = {
  success: false,
};

export function CategoryForm({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const action = createMenuCategory.bind(
    null,
    restaurantId
  );

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Add category
        </h2>

        <p className="text-sm text-muted-foreground">
          Organize your restaurant menu.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Category name
        </label>

        <input
          id="name"
          name="name"
          placeholder="Burgers"
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
          placeholder="Our burger selection..."
          rows={3}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="sortOrder"
          className="text-sm font-medium"
        >
          Display order
        </label>

        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min="0"
          defaultValue="0"
          className="w-full rounded-md border px-3 py-2"
        />
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
        className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
      >
        {isPending
          ? "Creating..."
          : "Create category"}
      </button>
    </form>
  );
}