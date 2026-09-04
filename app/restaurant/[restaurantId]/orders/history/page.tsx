import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";

type Props = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantOrderHistoryPage({
  params,
}: Props) {
  const { restaurantId } = await params;

  const { restaurant } =
    await requireRestaurantAccess(
      restaurantId
    );

  const orders =
    await prisma.order.findMany({
      where: {
        restaurantId,

        status: {
          in: [
            "DELIVERED",
            "CANCELLED",
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
          },
        },

        driver: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },

        _count: {
          select: {
            items: true,
          },
        },
      },
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Order History
          </h1>

          <p className="mt-2 text-muted-foreground">
            Completed and cancelled
            orders for{" "}
            {restaurant.name}.
          </p>
        </div>

        <Link
          href={`/restaurant/${restaurantId}/orders`}
          className="rounded-md border px-4 py-2"
        >
          Active Orders
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border p-10 text-center text-muted-foreground">
          No completed orders yet.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/restaurant/${restaurantId}/orders/history/${order.id}`}
              className="block rounded-xl border p-5 transition hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <h2 className="font-semibold">
                    Order #
                    {order.id.slice(-8)}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Customer:{" "}
                    {order.user.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {order._count.items}{" "}
                    items
                  </p>

                  {order.driver && (
                    <p className="text-sm text-muted-foreground">
                      Driver:{" "}
                      {
                        order.driver.user
                          .name
                      }
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="rounded bg-muted px-3 py-1 text-sm">
                    {order.status}
                  </span>

                  <p className="mt-2 font-semibold">
                    $
                    {Number(
                      order.total
                    ).toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}