"use client";

import { useActionState } from "react";

import {
  createOptionGroup,
  OptionGroupState,
} from "../../../actions";

const initialState: OptionGroupState = {
  success: false,
};

type Props = {
  restaurantId: string;
  itemId: string;
};

export function OptionGroupForm({
  restaurantId,
  itemId,
}: Props) {
  const action = createOptionGroup.bind(
    null,
    restaurantId,
    itemId
  );

  const [state, formAction, isPending] =
    useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Add option group
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Example: Size, Extras, Sauces.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Group name
        </label>

        <input
          id="name"
          name="name"
          placeholder="Size"
          className="w-full rounded-md border px-3 py-2"
        />

        {state.errors?.name && (
          <p className="text-sm text-red-500">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="minSelect"
            className="text-sm font-medium"
          >
            Minimum selections
          </label>

          <input
            id="minSelect"
            name="minSelect"
            type="number"
            min="0"
            defaultValue="0"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="maxSelect"
            className="text-sm font-medium"
          >
            Maximum selections
          </label>

          <input
            id="maxSelect"
            name="maxSelect"
            type="number"
            min="1"
            defaultValue="1"
            className="w-full rounded-md border px-3 py-2"
          />

          {state.errors?.maxSelect && (
            <p className="text-sm text-red-500">
              {state.errors.maxSelect[0]}
            </p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="required"
        />

        <span className="text-sm">
          Customer must choose from this group
        </span>
      </label>

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
          : "Create option group"}
      </button>
    </form>
  );
}