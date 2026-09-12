import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  RestaurantApprovalStatus,
} from "@/app/generated/prisma/client";
import {
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  reactivateRestaurant,
} from "./actions";

export default async function AdminRestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          orders: true,
          menuItems: true,
          reviews: true,
        },
      },
    },
  });

  const pendingCount = restaurants.filter(
    (restaurant) =>
      restaurant.approvalStatus === RestaurantApprovalStatus.PENDING
  ).length;

  const approvedCount = restaurants.filter(
    (restaurant) =>
      restaurant.approvalStatus === RestaurantApprovalStatus.APPROVED
  ).length;

  const rejectedCount = restaurants.filter(
    (restaurant) =>
      restaurant.approvalStatus === RestaurantApprovalStatus.REJECTED
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Restaurants
        </h2>

        <p className="text-muted-foreground">
          Manage restaurant applications and restaurants on the platform.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Total
          </p>

          <p className="mt-2 text-3xl font-bold">
            {restaurants.length}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Approved
          </p>

          <p className="mt-2 text-3xl font-bold">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Rejected
          </p>

          <p className="mt-2 text-3xl font-bold">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Restaurant list */}
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">
            All Restaurants
          </h3>
        </div>

        {restaurants.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No restaurants found.
          </div>
        ) : (
          <div className="divide-y">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                {/* Restaurant info */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">
                      {restaurant.name}
                    </h4>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        restaurant.approvalStatus ===
                        RestaurantApprovalStatus.APPROVED
                          ? "bg-green-100 text-green-700"
                          : restaurant.approvalStatus ===
                              RestaurantApprovalStatus.REJECTED
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {restaurant.approvalStatus}
                    </span>

                    {restaurant.approvalStatus ===
                      RestaurantApprovalStatus.APPROVED && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          restaurant.isActive
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {restaurant.isActive
                          ? "ACTIVE"
                          : "SUSPENDED"}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {restaurant.owner.name} ·{" "}
                    {restaurant.owner.email}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      Orders: {restaurant._count.orders}
                    </span>

                    <span>
                      Menu items: {restaurant._count.menuItems}
                    </span>

                    <span>
                      Reviews: {restaurant._count.reviews}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/restaurants/${restaurant.id}`}
                    className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    View
                  </Link>

                  {restaurant.approvalStatus ===
                    RestaurantApprovalStatus.PENDING && (
                    <>
                      <form
                        action={approveRestaurant.bind(
                          null,
                          restaurant.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </form>

                      <form
                        action={rejectRestaurant.bind(
                          null,
                          restaurant.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </form>
                    </>
                  )}

                  {restaurant.approvalStatus ===
                    RestaurantApprovalStatus.APPROVED &&
                    restaurant.isActive && (
                      <form
                        action={suspendRestaurant.bind(
                          null,
                          restaurant.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                          Suspend
                        </button>
                      </form>
                    )}

                  {restaurant.approvalStatus ===
                    RestaurantApprovalStatus.APPROVED &&
                    !restaurant.isActive && (
                      <form
                        action={reactivateRestaurant.bind(
                          null,
                          restaurant.id
                        )}
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Reactivate
                        </button>
                      </form>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}