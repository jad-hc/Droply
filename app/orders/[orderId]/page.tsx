import { notFound } from "next/navigation";
import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

type Props = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderPage({
  params,
}: Props) {
  const { orderId } =
    await params;

  const user =
    await requireUser();

  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },

      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },

        items: true,
      },
    });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-xl border p-6">
        <div className="text-center">
          <div className="text-4xl">
            ✓
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Order placed!
          </h1>

          <p className="mt-2 text-muted-foreground">
            Your order has been sent to{" "}
            {order.restaurant.name}.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Order #{order.id}
          </p>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between">
            <span>Status</span>

            <strong>
              {order.status}
            </strong>
          </div>

          <div className="mt-2 flex justify-between">
            <span>Payment</span>

            <span>
              {order.paymentMethod}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="font-semibold">
            Items
          </h2>

          <div className="mt-4 space-y-4">
            {order.items.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >
                  <div>
                    <p>
                      {item.quantity} ×{" "}
                      {item.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      $
                      {Number(
                        item.unitPrice
                      ).toFixed(2)}{" "}
                      each
                    </p>
                  </div>

                  <strong>
                    $
                    {Number(
                      item.total
                    ).toFixed(2)}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t pt-6">
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

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>

            <span>
              $
              {Number(
                order.total
              ).toFixed(2)}
            </span>
          </div>
        </div>

        <Link
          href="/restaurants"
          className="mt-8 block rounded-md border px-5 py-3 text-center"
        >
          Back to restaurants
        </Link>
      </div>
    </main>
  );
}