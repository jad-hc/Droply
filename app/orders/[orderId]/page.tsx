import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

import { AutoRefresh } from "@/components/auto-refresh";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

const ORDER_STEPS = [
  "PENDING",
  "RESTAURANT_ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
] as const;

function formatOrderStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

type SelectedOptionSnapshot = {
  groupId?: string;
  groupName?: string;
  optionId?: string;
  optionName?: string;
  priceAdjustment?: number;
};

export default async function OrderPage({
  params,
}: Props) {
  const { orderId } = await params;

  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },

    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          phone: true,
          address: true,
          city: true,
          area: true,
        },
      },

      driver: {
        include: {
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },

      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const currentStep = ORDER_STEPS.indexOf(
    order.status as (typeof ORDER_STEPS)[number]
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* HEADER */}
      {order.status !== "DELIVERED" &&
        order.status !== "CANCELLED" && (
          <AutoRefresh interval={3000} />
        )}

      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold">
            Order Details
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Order #{order.id}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {order.createdAt.toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block rounded-md bg-muted px-3 py-1 text-sm font-medium">
            {formatOrderStatus(order.status)}
          </span>

          <p className="mt-3 text-xl font-bold">
            ${Number(order.total).toFixed(2)}
          </p>
        </div>
      </div>

      {/* SUCCESS / CANCELLED MESSAGE */}

      {order.status === "CANCELLED" ? (
        <div className="mt-8 rounded-xl border border-red-200 p-5">
          <h2 className="font-semibold text-red-600">
            Order Cancelled
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            This order has been cancelled.
          </p>
        </div>
      ) : order.status === "DELIVERED" ? (
        <div className="mt-8 rounded-xl border p-5">
          <h2 className="font-semibold">
            Order Delivered
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your order was delivered successfully.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border p-5">
          <h2 className="font-semibold">
            Your order is in progress
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Check the progress below for the latest status.
          </p>
        </div>
      )}

      {/* ORDER PROGRESS */}

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Order Progress
        </h2>

        {order.status === "CANCELLED" ? (
          <div className="mt-5 rounded-lg bg-muted/50 p-4 text-sm text-red-600">
            This order will not continue through the
            delivery process.
          </div>
        ) : (
          <div className="mt-6 space-y-1">
            {ORDER_STEPS.map((step, index) => {
              const completed =
                index <= currentStep;

              const current =
                index === currentStep;

              const isLast =
                index ===
                ORDER_STEPS.length - 1;

              return (
                <div
                  key={step}
                  className="relative flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${
                        completed
                          ? "bg-foreground text-background"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    {!isLast && (
                      <div
                        className={`min-h-10 w-px flex-1 ${
                          index < currentStep
                            ? "bg-foreground"
                            : "bg-border"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-7 pt-2">
                    <p
                      className={
                        completed
                          ? "font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {formatOrderStatus(step)}
                    </p>

                    {current &&
                      order.status !==
                        "DELIVERED" && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Current status
                        </p>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RESTAURANT */}

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Restaurant
        </h2>

        <div className="mt-5 flex items-start gap-4">
          {order.restaurant.logo && (
            <img
              src={order.restaurant.logo}
              alt={order.restaurant.name}
              className="h-16 w-16 rounded-lg border object-cover"
            />
          )}

          <div>
            <Link
              href={`/restaurants/${order.restaurant.slug}`}
              className="font-semibold hover:underline"
            >
              {order.restaurant.name}
            </Link>

            <p className="mt-1 text-sm text-muted-foreground">
              {[
                order.restaurant.area,
                order.restaurant.city,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>

            {order.restaurant.address && (
              <p className="mt-1 text-sm text-muted-foreground">
                {order.restaurant.address}
              </p>
            )}

            {order.restaurant.phone && (
              <p className="mt-1 text-sm text-muted-foreground">
                {order.restaurant.phone}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* DRIVER */}

      {order.driver && (
        <section className="mt-8 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Your Driver
          </h2>

          <div className="mt-5">
            <p className="font-semibold">
              {order.driver.user.name}
            </p>

            {(order.driver.vehicleType ||
              order.driver.vehicleModel) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[
                  order.driver.vehicleType,
                  order.driver.vehicleModel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}

            {order.driver.vehiclePlate && (
              <p className="mt-1 text-sm text-muted-foreground">
                Plate: {order.driver.vehiclePlate}
              </p>
            )}

            {order.driver.user.phone && (
              <p className="mt-1 text-sm text-muted-foreground">
                Phone: {order.driver.user.phone}
              </p>
            )}
          </div>
        </section>
      )}

      {/* DELIVERY ADDRESS */}

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Delivery Address
        </h2>

        <div className="mt-4">
          <p>{order.deliveryAddress}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {[order.area, order.city]
              .filter(Boolean)
              .join(", ")}
          </p>

          {(order.building ||
            order.floor ||
            order.apartment) && (
            <p className="mt-2 text-sm text-muted-foreground">
              {order.building &&
                `Building: ${order.building}`}

              {order.floor &&
                ` · Floor: ${order.floor}`}

              {order.apartment &&
                ` · Apt: ${order.apartment}`}
            </p>
          )}

          {order.instructions && (
            <div className="mt-4 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Delivery instructions
              </p>

              <p className="mt-1 text-sm">
                {order.instructions}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ITEMS */}

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Order Items
        </h2>

        <div className="mt-6 space-y-6">
          {order.items.map((item) => {
            const options =
              Array.isArray(item.selectedOptions)
                ? (item.selectedOptions as SelectedOptionSnapshot[])
                : [];

            return (
              <div
                key={item.id}
                className="border-b pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between gap-5">
                  <div>
                    <p className="font-medium">
                      {item.quantity} × {item.name}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      ${Number(item.unitPrice).toFixed(2)} each
                    </p>
                  </div>

                  <strong>
                    ${Number(item.total).toFixed(2)}
                  </strong>
                </div>

                {options.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {options.map((option, index) => (
                      <p
                        key={
                          option.optionId ??
                          `${item.id}-${index}`
                        }
                        className="text-sm text-muted-foreground"
                      >
                        {option.groupName && (
                          <>
                            {option.groupName}:{" "}
                          </>
                        )}

                        {option.optionName}

                        {(option.priceAdjustment ??
                          0) > 0 &&
                          ` (+$${Number(
                            option.priceAdjustment
                          ).toFixed(2)})`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* PAYMENT + TOTAL */}

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Payment Summary
        </h2>

        <div className="mt-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span>
              ${Number(order.subtotal).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Delivery fee
            </span>

            <span>
              ${Number(order.deliveryFee).toFixed(2)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span>
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Payment method
            </span>

            <span>
              {formatOrderStatus(
                order.paymentMethod
              )}
            </span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">
              Payment status
            </span>

            <span>
              {formatOrderStatus(
                order.paymentStatus
              )}
            </span>
          </div>
        </div>
      </section>

      {/* ACTIONS */}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/orders"
          className="rounded-md border px-5 py-2"
        >
          All Orders
        </Link>

        <Link
          href={`/restaurants/${order.restaurant.slug}`}
          className="rounded-md bg-foreground px-5 py-2 text-background"
        >
          Order Again
        </Link>
      </div>
    </main>
  );
}