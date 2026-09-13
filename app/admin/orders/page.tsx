import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import {
  OrderStatus,
  PaymentStatus,
  UserRole,
} from "@/app/generated/prisma/client";

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

const PAGE_SIZE = 20;

const statusOptions = Object.values(OrderStatus);

function formatStatus(status: OrderStatus) {
  return status.replaceAll("_", " ");
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

function formatMoney(value: unknown) {
  return Number(value).toFixed(2);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(UserRole.ADMIN);

  const params = await searchParams;

  const q = params.q?.trim() || "";
  const requestedStatus = params.status;

  const page = Math.max(Number(params.page) || 1, 1);

  const status = statusOptions.includes(
    requestedStatus as OrderStatus
  )
    ? (requestedStatus as OrderStatus)
    : undefined;

  const where = {
    ...(status
      ? {
          status,
        }
      : {}),

    ...(q
      ? {
          OR: [
            {
              id: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              user: {
                email: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              restaurant: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
    orders,
    totalOrders,
    pendingCount,
    activeCount,
    deliveredCount,
    cancelledCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.order.count({
      where,
    }),

    prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    }),

    prisma.order.count({
      where: {
        status: {
          notIn: [
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
          ],
        },
      },
    }),

    prisma.order.count({
      where: {
        status: OrderStatus.DELIVERED,
      },
    }),

    prisma.order.count({
      where: {
        status: OrderStatus.CANCELLED,
      },
    }),
  ]);

  const totalPages = Math.max(
    Math.ceil(totalOrders / PAGE_SIZE),
    1
  );

  function buildUrl(nextPage: number) {
    const search = new URLSearchParams();

    if (q) {
      search.set("q", q);
    }

    if (status) {
      search.set("status", status);
    }

    search.set("page", String(nextPage));

    return `/admin/orders?${search.toString()}`;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Order Management
        </h1>

        <p className="mt-2 text-muted-foreground">
          Monitor and investigate all platform orders.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Matching
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active
          </p>

          <p className="mt-2 text-3xl font-bold">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Delivered
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {deliveredCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Cancelled
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {cancelledCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form
        method="GET"
        className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search order, customer or restaurant..."
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>

          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {formatStatus(value)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Filter
        </button>

        {(q || status) && (
          <Link
            href="/admin/orders"
            className="flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  Order
                </th>

                <th className="px-4 py-3 text-left">
                  Customer
                </th>

                <th className="px-4 py-3 text-left">
                  Restaurant
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Payment
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3 text-left">
                  Created
                </th>

                <th className="px-4 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      #{order.id.slice(-8)}
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      {order.id}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-medium">
                      {order.user.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {order.user.email}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <Link
                      href={`/restaurants/${order.restaurant.slug}`}
                      className="hover:underline"
                    >
                      {order.restaurant.name}
                    </Link>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {order.paymentStatus}
                  </td>

                  <td className="px-4 py-4 text-right font-medium">
                    ${formatMoney(order.total)}
                  </td>

                  <td className="px-4 py-4 text-muted-foreground">
                    {order.createdAt.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-md border px-3 py-2 text-xs font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Previous
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={buildUrl(page + 1)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
