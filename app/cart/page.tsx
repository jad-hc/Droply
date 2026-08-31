"use client";

import Link from "next/link";

import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const items = useCartStore(
    (state) => state.items
  );

  const removeItem = useCartStore(
    (state) => state.removeItem
  );

  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  const clearCart = useCartStore(
    (state) => state.clearCart
  );

  const total = items.reduce(
    (sum, item) =>
      sum + item.unitPrice * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-xl border p-10 text-center">
          <h1 className="text-2xl font-bold">
            Your cart is empty
          </h1>

          <p className="mt-2 text-muted-foreground">
            Add something delicious from a restaurant.
          </p>

          <Link
            href="/restaurants"
            className="mt-6 inline-block rounded-md bg-foreground px-5 py-2 text-background"
          >
            Browse restaurants
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Your Cart
          </h1>

          <p className="mt-1 text-muted-foreground">
            {items[0].restaurantName}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-sm text-red-500"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.cartItemId}
            className="flex gap-5 rounded-xl border p-5"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-28 rounded-lg object-cover"
              />
            )}

            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    {item.name}
                  </h2>

                  {item.selectedOptions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.selectedOptions.map(
                        (option) => (
                          <p
                            key={option.id}
                            className="text-sm text-muted-foreground"
                          >
                            {option.name}

                            {option.priceAdjustment > 0 &&
                              ` (+$${option.priceAdjustment.toFixed(
                                2
                              )})`}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>

                <strong>
                  $
                  {(
                    item.unitPrice *
                    item.quantity
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      decreaseQuantity(
                        item.cartItemId
                      )
                    }
                    className="h-8 w-8 rounded-md border"
                  >
                    -
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(
                        item.cartItemId
                      )
                    }
                    className="h-8 w-8 rounded-md border"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() =>
                    removeItem(
                      item.cartItemId
                    )
                  }
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border p-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal</span>

          <span>
            ${total.toFixed(2)}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Delivery fees will be calculated at checkout.
        </p>

        <Link
          href="/checkout"
          className="mt-6 block rounded-md bg-foreground px-5 py-3 text-center font-medium text-background"
        >
          Continue to checkout
        </Link>
      </div>
    </main>
  );
}