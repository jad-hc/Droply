import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      restaurant: {
        select: {
          name: true,
          slug: true,
          logo: true,
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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>

        <p className="mt-2 text-muted-foreground">
          View your current and previous orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border p-10 text-center">
          <p className="text-muted-foreground">
            You haven't placed any orders yet.
          </p>

          <Link
            href="/restaurants"
            className="mt-5 inline-block rounded-md bg-foreground px-5 py-2 text-background"
          >
            Browse restaurants
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between gap-5 rounded-xl border p-5 transition hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                {order.restaurant.logo && (
                  <img
                    src={order.restaurant.logo}
                    alt={order.restaurant.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                )}

                <div>
                  <h2 className="font-semibold">
                    {order.restaurant.name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {order._count.items} items
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {order.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="rounded-md bg-muted px-3 py-1 text-sm">
                  {order.status}
                </span>

                <p className="mt-2 font-semibold">
                  ${Number(order.total).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}