"use client";

import { useActionState } from "react";
import { Star } from "lucide-react";

import {
  ReviewState,
  submitOrderReview,
} from "./actions";

const initialState: ReviewState = {
  success: false,
};

function RatingInput({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
      </label>

      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map(
          (rating) => (
            <label
              key={rating}
              className="cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                value={rating}
                className="sr-only peer"
                required
              />

              <Star className="h-7 w-7 text-muted-foreground peer-checked:fill-yellow-400 peer-checked:text-yellow-400" />
            </label>
          )
        )}
      </div>
    </div>
  );
}

export function ReviewForm({
  orderId,
  hasDriver,
}: {
  orderId: string;
  hasDriver: boolean;
}) {
  const action =
    submitOrderReview.bind(
      null,
      orderId
    );

  const [state, formAction, isPending] =
    useActionState(
      action,
      initialState
    );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Rate your order
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your experience.
        </p>
      </div>

      <RatingInput
        name="restaurantRating"
        label="Restaurant rating"
      />

      <div>
        <label className="text-sm font-medium">
          Restaurant comment
        </label>

        <textarea
          name="restaurantComment"
          rows={4}
          placeholder="How was the food and service?"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      {hasDriver && (
        <>
          <RatingInput
            name="driverRating"
            label="Driver rating"
          />

          <div>
            <label className="text-sm font-medium">
              Driver comment
            </label>

            <textarea
              name="driverComment"
              rows={3}
              placeholder="How was the delivery experience?"
              className="mt-2 w-full rounded-md border px-3 py-2"
            />
          </div>
        </>
      )}

      {state.message && (
        <p className="text-sm text-red-500">
          {state.message}
        </p>
      )}

      <button
        disabled={isPending}
        className="rounded-md bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        {isPending
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </form>
  );
}