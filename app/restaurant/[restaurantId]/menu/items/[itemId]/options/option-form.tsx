"use client";

import { useActionState } from "react";

import {
  createMenuItemOption,
  MenuItemOptionState,
} from "../../../actions";

type Props = {
  restaurantId: string;
  itemId: string;
  optionGroupId: string;
};

const initialState: MenuItemOptionState = {
  success: false,
};

export function OptionForm({
  restaurantId,
  itemId,
  optionGroupId,
}: Props) {
  const action = createMenuItemOption.bind(
    null,
    restaurantId,
    itemId,
    optionGroupId
  );

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]"
    >
      <div>
        <input
          name="name"
          placeholder="Cheese"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.name && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <input
          name="priceAdjustment"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          placeholder="0.00"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.priceAdjustment && (
          <p className="mt-1 text-sm text-red-500">
            {state.errors.priceAdjustment[0]}
          </p>
        )}
      </div>

      <button
        disabled={isPending}
        className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}