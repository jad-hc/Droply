import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import {
  UserRole,
  OrderStatus,
} from "@/app/generated/prisma/client";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(value: unknown) {
  return Number(value).toFixed(2);
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-700";

    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-700";

    case OrderStatus.PENDING:
      return "bg-yellow-100 text-yellow-700";

    case OrderStatus.ON_THE_WAY:
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireRole(UserRole.ADMIN);

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      user: true,

      restaurant: true,

      driver: {
        include: {
          user: true,
        },
      },

      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to orders
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{order.id.slice(-8)}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {order.id}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusClass(
              order.status
            )}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      {/* Customer / Restaurant / Driver */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">
            Customer
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">
                Name:
              </span>{" "}
              {order.user.name}
            </p>

            <p>
              <span className="text-muted-foreground">
                Email:
              </span>{" "}
              {order.user.email}
            </p>

            <p>
              <span className="text-muted-foreground">
                Phone:
              </span>{" "}
              {order.user.phone || "—"}
            </p>

            <Link
              href={`/admin/users/${order.user.id}`}
              className="inline-block pt-2 text-sm font-medium hover:underline"
            >
              View customer →
            </Link>
          </div>
        </div>

        {/* Restaurant */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">
            Restaurant
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p className="font-medium">
              {order.restaurant.name}
            </p>

            <p className="text-muted-foreground">
              {order.restaurant.address || "No address"}
            </p>

            <p>
              <span className="text-muted-foreground">
                Phone:
              </span>{" "}
              {order.restaurant.phone || "—"}
            </p>

            <Link
              href={`/admin/restaurants/${order.restaurant.id}`}
              className="inline-block pt-2 text-sm font-medium hover:underline"
            >
              View restaurant →
            </Link>
          </div>
        </div>

        {/* Driver */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">
            Driver
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            {order.driver ? (
              <>
                <p className="font-medium">
                  {order.driver.user.name}
                </p>

                <p className="text-muted-foreground">
                  {order.driver.user.email}
                </p>

                <p>
                  <span className="text-muted-foreground">
                    Status:
                  </span>{" "}
                  {order.driver.status}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No driver assigned.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            Order Items
          </h2>
        </div>

        <div className="divide-y">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 px-6 py-5"
            >
              <div>
                <p className="font-medium">
                  {item.quantity} × {item.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Unit price: ${formatMoney(item.unitPrice)}
                </p>

                {item.selectedOptions &&
                  Array.isArray(item.selectedOptions) &&
                  item.selectedOptions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Selected options
                      </p>

                      <pre className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                        {JSON.stringify(
                          item.selectedOptions,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
              </div>

              <p className="font-medium">
                ${formatMoney(item.total)}
              </p>
            </div>
          ))}

          {order.items.length === 0 && (
            <div className="px-6 py-8 text-center text-muted-foreground">
              No items found.
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-3 border-t px-6 py-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span>
              ${formatMoney(order.subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Delivery fee
            </span>

            <span>
              ${formatMoney(order.deliveryFee)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-bold">
            <span>Total</span>

            <span>
              ${formatMoney(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">
          Delivery Information
        </h2>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Address
            </p>

            <p className="mt-1">
              {order.deliveryAddress}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              City
            </p>

            <p className="mt-1">
              {order.city}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Area
            </p>

            <p className="mt-1">
              {order.area || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Building
            </p>

            <p className="mt-1">
              {order.building || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Floor
            </p>

            <p className="mt-1">
              {order.floor || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Apartment
            </p>

            <p className="mt-1">
              {order.apartment || "—"}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Instructions
            </p>

            <p className="mt-1">
              {order.instructions || "—"}
            </p>
          </div>
        </div>

        {/* Coordinates */}
        <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Latitude
            </p>

            <p className="mt-1">
              {order.deliveryLatitude ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Longitude
            </p>

            <p className="mt-1">
              {order.deliveryLongitude ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">
          Payment
        </h2>

        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Method
            </p>

            <p className="mt-1 font-medium">
              {order.paymentMethod}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="mt-1 font-medium">
              {order.paymentStatus}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Total
            </p>

            <p className="mt-1 font-medium">
              ${formatMoney(order.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">
          Order Timeline
        </h2>

        <div className="mt-4 space-y-4 text-sm">
          <div className="flex justify-between border-b pb-3">
            <span className="text-muted-foreground">
              Created
            </span>

            <span>
              {order.createdAt.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Last updated
            </span>

            <span>
              {order.updatedAt.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}