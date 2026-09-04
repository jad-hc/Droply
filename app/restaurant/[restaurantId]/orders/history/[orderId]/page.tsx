import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";

type Props = {
  params: Promise<{
    restaurantId: string;
    orderId: string;
  }>;
};

type SelectedOption = {
  groupName?: string;
  optionName?: string;
  priceAdjustment?: number;
};

export default async function RestaurantOrderHistoryDetailPage({
  params,
}: Props) {
  const {
    restaurantId,
    orderId,
  } = await params;

  await requireRestaurantAccess(
    restaurantId
  );

  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },

      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Order #
        {order.id.slice(-8)}
      </h1>

      <p className="mt-2 text-muted-foreground">
        {order.createdAt.toLocaleString()}
      </p>

      <section className="mt-8 rounded-xl border p-6">
        <div className="flex justify-between">
          <span>Status</span>

          <strong>
            {order.status}
          </strong>
        </div>

        <div className="mt-3 flex justify-between">
          <span>
            Payment
          </span>

          <span>
            {order.paymentMethod} ·{" "}
            {order.paymentStatus}
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Customer
        </h2>

        <p className="mt-4">
          {order.user.name}
        </p>

        {order.user.phone && (
          <p className="text-sm text-muted-foreground">
            {order.user.phone}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          {order.deliveryAddress}
        </p>

        <p className="text-sm text-muted-foreground">
          {[order.area, order.city]
            .filter(Boolean)
            .join(", ")}
        </p>
      </section>

      {order.driver && (
        <section className="mt-6 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Driver
          </h2>

          <p className="mt-4">
            {order.driver.user.name}
          </p>

          {order.driver.user.phone && (
            <p className="text-sm text-muted-foreground">
              {
                order.driver.user
                  .phone
              }
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">
          Items
        </h2>

        <div className="mt-5 space-y-5">
          {order.items.map(
            (item) => {
              const options =
                Array.isArray(
                  item.selectedOptions
                )
                  ? (item.selectedOptions as SelectedOption[])
                  : [];

              return (
                <div
                  key={item.id}
                  className="border-b pb-5 last:border-none last:pb-0"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {item.quantity} ×{" "}
                        {item.name}
                      </p>

                      {options.map(
                        (
                          option,
                          index
                        ) => (
                          <p
                            key={
                              index
                            }
                            className="text-sm text-muted-foreground"
                          >
                            {option.groupName &&
                              `${option.groupName}: `}

                            {
                              option.optionName
                            }
                          </p>
                        )
                      )}
                    </div>

                    <strong>
                      $
                      {Number(
                        item.total
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>
              Subtotal
            </span>

            <span>
              $
              {Number(
                order.subtotal
              ).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              Delivery fee
            </span>

            <span>
              $
              {Number(
                order.deliveryFee
              ).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>

            <span>
              $
              {Number(
                order.total
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}