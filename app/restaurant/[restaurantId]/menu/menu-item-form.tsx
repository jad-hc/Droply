"use client";

import { useActionState } from "react";

import { ImageUpload } from "@/components/restaurant/image-upload";

import {
  createMenuItem,
  MenuItemState,
} from "./actions";

type Category = {
  id: string;
  name: string;
};

type Props = {
  restaurantId: string;
  categories: Category[];
};

const initialState: MenuItemState = {
  success: false,
};

export function MenuItemForm({
  restaurantId,
  categories,
}: Props) {
  const action = createMenuItem.bind(
    null,
    restaurantId
  );

  const [state, formAction, isPending] =
    useActionState(
      action,
      initialState
    );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Add menu item
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add a new dish or product to your menu.
        </p>
      </div>

      <ImageUpload
        name="image"
        label="Food image"
        restaurantId={restaurantId}
        folder="menu"
      />

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Item name
        </label>

        <input
          id="name"
          name="name"
          placeholder="Classic Burger"
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
          rows={3}
          placeholder="Beef patty, cheese, lettuce..."
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="categoryId"
          className="text-sm font-medium"
        >
          Category
        </label>

        <select
          id="categoryId"
          name="categoryId"
          defaultValue=""
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">
            Select category
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}
        </select>

        {state.errors?.categoryId && (
          <p className="text-sm text-red-500">
            {state.errors.categoryId[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="price"
          className="text-sm font-medium"
        >
          Price
        </label>

        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="8.50"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.price && (
          <p className="text-sm text-red-500">
            {state.errors.price[0]}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2">
          <input
            name="isAvailable"
            type="checkbox"
            defaultChecked
          />

          <span className="text-sm">
            Available
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            name="isFeatured"
            type="checkbox"
          />

          <span className="text-sm">
            Featured
          </span>
        </label>
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
        type="submit"
        disabled={
          isPending ||
          categories.length === 0
        }
        className="rounded-md bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        {isPending
          ? "Creating..."
          : "Create item"}
      </button>

      {categories.length === 0 && (
        <p className="text-sm text-amber-600">
          Create a category before adding menu items.
        </p>
      )}
    </form>
  );
}