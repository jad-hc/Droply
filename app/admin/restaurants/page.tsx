import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

import {
  approveRestaurant,
  reactivateRestaurant,
  suspendRestaurant,
} from "./actions";

export default async function AdminRestaurantsPage() {
  await requireRole(
    UserRole.ADMIN
  );

  const restaurants =
    await prisma.restaurant.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        owner: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },

        _count: {
          select: {
            menuItems: true,
            orders: true,
          },
        },
      },
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">
          Restaurants
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review and manage restaurant applications.
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="mt-8 rounded-xl border p-10 text-center text-muted-foreground">
          No restaurants found.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {restaurants.map(
            (restaurant) => (
              <div
                key={
                  restaurant.id
                }
                className="rounded-xl border p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex gap-4">
                    {restaurant.logo && (
                      <img
                        src={
                          restaurant.logo
                        }
                        alt={
                          restaurant.name
                        }
                        className="h-16 w-16 rounded-lg border object-cover"
                      />
                    )}

                    <div>
                      <h2 className="text-lg font-semibold">
                        {
                          restaurant.name
                        }
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Owner:{" "}
                        {
                          restaurant
                            .owner
                            .name
                        }
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {
                          restaurant
                            .owner
                            .email
                        }
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {[
                          restaurant.area,
                          restaurant.city,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="rounded bg-muted px-2 py-1 text-xs">
                        {restaurant.isApproved
                          ? "Approved"
                          : "Pending"}
                      </span>

                      <span className="rounded bg-muted px-2 py-1 text-xs">
                        {restaurant.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {
                        restaurant
                          ._count
                          .menuItems
                      }{" "}
                      menu items ·{" "}
                      {
                        restaurant
                          ._count
                          .orders
                      }{" "}
                      orders
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                  <Link
                    href={`/restaurants/${restaurant.slug}`}
                    className="rounded-md border px-4 py-2 text-sm"
                  >
                    View Restaurant
                  </Link>

                  {!restaurant.isApproved && (
                    <form
                      action={approveRestaurant.bind(
                        null,
                        restaurant.id
                      )}
                    >
                      <button className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
                        Approve
                      </button>
                    </form>
                  )}

                  {restaurant.isApproved &&
                    restaurant.isActive && (
                      <form
                        action={suspendRestaurant.bind(
                          null,
                          restaurant.id
                        )}
                      >
                        <button className="rounded-md border px-4 py-2 text-sm text-red-600">
                          Suspend
                        </button>
                      </form>
                    )}

                  {restaurant.isApproved &&
                    !restaurant.isActive && (
                      <form
                        action={reactivateRestaurant.bind(
                          null,
                          restaurant.id
                        )}
                      >
                        <button className="rounded-md bg-foreground px-4 py-2 text-sm text-background">
                          Reactivate
                        </button>
                      </form>
                    )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}