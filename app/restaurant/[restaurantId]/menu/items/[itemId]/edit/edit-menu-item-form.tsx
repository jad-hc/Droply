"use client";

import { useActionState } from "react";

import { ImageUpload } from "@/components/restaurant/image-upload";

import {
  MenuItemState,
  updateMenuItem,
} from "../../../actions";

type Category = {
  id: string;
  name: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: unknown;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
};

type Props = {
  restaurantId: string;
  item: MenuItem;
  categories: Category[];
};

const initialState: MenuItemState = {
  success: false,
};

export function EditMenuItemForm({
  restaurantId,
  item,
  categories,
}: Props) {
  const action = updateMenuItem.bind(
    null,
    restaurantId,
    item.id
  );

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      <ImageUpload
        name="image"
        label="Food image"
        restaurantId={restaurantId}
        folder="menu"
        initialValue={item.image}
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
          type="text"
          defaultValue={item.name}
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
          rows={4}
          defaultValue={item.description ?? ""}
          placeholder="Describe the menu item..."
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.description && (
          <p className="text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
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
          defaultValue={item.categoryId}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">
            Select category
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
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
          defaultValue={Number(item.price)}
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
            defaultChecked={item.isAvailable}
          />

          <span className="text-sm">
            Available
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={item.isFeatured}
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
        disabled={isPending}
        className="rounded-md bg-foreground px-5 py-2 text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Save Changes"}
      </button>
    </form>
  );
}