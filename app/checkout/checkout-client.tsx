"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCartStore } from "@/stores/cart-store";

type Address = {
  id: string;
  label: string | null;
  addressLine: string;
  city: string;
  area: string | null;
  building: string | null;
  floor: string | null;
  apartment: string | null;
  isDefault: boolean;
};

type Props = {
  addresses: Address[];
};

export function CheckoutClient({
  addresses,
}: Props) {
  const router = useRouter();

  const items = useCartStore(
    (state) => state.items
  );

  const clearCart = useCartStore(
    (state) => state.clearCart
  );

  const [mounted, setMounted] =
    useState(false);

  const [addressId, setAddressId] =
    useState(
      addresses.find(
        (address) => address.isDefault
      )?.id ??
        addresses[0]?.id ??
        ""
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <p className="text-muted-foreground">
        Loading checkout...
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <h2 className="text-xl font-semibold">
          Your cart is empty
        </h2>

        <Link
          href="/restaurants"
          className="mt-5 inline-block rounded-md bg-foreground px-5 py-2 text-background"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  const cartSubtotal =
    items.reduce(
      (total, item) =>
        total +
        item.unitPrice *
          item.quantity,
      0
    );

  async function handlePlaceOrder() {
    setError("");

    if (!addressId) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/checkout/place-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            addressId,

            paymentMethod: "CASH",

            items: items.map(
              (item) => ({
                menuItemId:
                  item.menuItemId,

                quantity:
                  item.quantity,

                selectedOptionIds:
                  item.selectedOptions.map(
                    (option) =>
                      option.id
                  ),
              })
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Unable to place order."
        );
      }

      clearCart();

      router.push(
        `/orders/${data.orderId}`
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to place order."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {/* ADDRESS */}

        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Delivery Address
          </h2>

          {addresses.length === 0 ? (
            <div className="mt-5">
              <p className="text-sm text-muted-foreground">
                You don't have a delivery address yet.
              </p>

              <Link
                href="/account/addresses"
                className="mt-4 inline-block rounded-md border px-4 py-2 text-sm"
              >
                Add address
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {addresses.map(
                (address) => (
                  <label
                    key={address.id}
                    className="flex cursor-pointer gap-3 rounded-lg border p-4"
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={
                        addressId ===
                        address.id
                      }
                      onChange={() =>
                        setAddressId(
                          address.id
                        )
                      }
                    />

                    <div>
                      <div className="flex gap-2">
                        <span className="font-medium">
                          {address.label ??
                            "Address"}
                        </span>

                        {address.isDefault && (
                          <span className="rounded bg-muted px-2 py-0.5 text-xs">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm">
                        {
                          address.addressLine
                        }
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {[
                          address.area,
                          address.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </label>
                )
              )}
            </div>
          )}
        </section>

        {/* PAYMENT */}

        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Payment
          </h2>

          <label className="mt-5 flex items-center gap-3 rounded-lg border p-4">
            <input
              type="radio"
              checked
              readOnly
            />

            <div>
              <p className="font-medium">
                Cash on Delivery
              </p>

              <p className="text-sm text-muted-foreground">
                Pay when your order arrives.
              </p>
            </div>
          </label>
        </section>
      </div>

      {/* ORDER SUMMARY */}

      <aside className="h-fit rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {items[0].restaurantName}
        </p>

        <div className="mt-6 space-y-5">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex justify-between gap-4"
            >
              <div>
                <p className="font-medium">
                  {item.quantity} ×{" "}
                  {item.name}
                </p>

                {item.selectedOptions.map(
                  (option) => (
                    <p
                      key={option.id}
                      className="text-xs text-muted-foreground"
                    >
                      {option.name}
                    </p>
                  )
                )}
              </div>

              <span className="text-sm">
                $
                {(
                  item.unitPrice *
                  item.quantity
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-5">
          <div className="flex justify-between">
            <span>Cart subtotal</span>

            <span>
              $
              {cartSubtotal.toFixed(2)}
            </span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            The final total is recalculated securely by the server.
          </p>
        </div>

        {error && (
          <p className="mt-5 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={
            isSubmitting ||
            addresses.length === 0
          }
          className="mt-6 w-full rounded-md bg-foreground px-5 py-3 font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Placing order..."
            : "Place Order"}
        </button>
      </aside>
    </div>
  );
}