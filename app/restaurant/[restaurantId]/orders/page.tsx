import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { OrderStatusControls } from "./order-status-controls";

import { OrdersRealtime } from "./orders-realtime";

type Props = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantOrdersPage({
  params,
}: Props) {
  const { restaurantId } = await params;

  const { restaurant } =
    await requireRestaurantAccess(restaurantId);

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      status: {
        in: [
          "PENDING",
          "RESTAURANT_ACCEPTED",
          "PREPARING",
          "READY_FOR_PICKUP",
        ],
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      user: {
        select: {
          name: true,
          phone: true,
        },
      },

      items: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <OrdersRealtime restaurantId={restaurantId} />
      
      <div>
        <h1 className="text-3xl font-bold">
          Orders
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage incoming orders for {restaurant.name}.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border p-10 text-center text-muted-foreground">
          No active orders.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    Order #{order.id.slice(-8)}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.user.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress}
                  </p>
                </div>

                <div className="text-right">
                  <span className="rounded-md bg-muted px-3 py-1 text-sm">
                    {order.status}
                  </span>

                  <p className="mt-2 font-semibold">
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t pt-5">
                <h3 className="font-medium">
                  Items
                </h3>

                <div className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-4"
                    >
                      <div>
                        <p>
                          {item.quantity} × {item.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          ${Number(item.unitPrice).toFixed(2)} each
                        </p>
                      </div>

                      <strong>
                        ${Number(item.total).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t pt-5">
                <OrderStatusControls
                  restaurantId={restaurantId}
                  orderId={order.id}
                  status={order.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}