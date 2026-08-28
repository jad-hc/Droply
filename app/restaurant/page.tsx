import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireAnyRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export default async function RestaurantDashboardPage() {
  const user = await requireAnyRole([
    UserRole.RESTAURANT_OWNER,
    UserRole.RESTAURANT_STAFF,
  ]);

  const memberships =
    await prisma.restaurantMember.findMany({
      where: {
        userId: user.id,
      },

      include: {
        restaurant: true,
      },
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">
          Restaurant Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Welcome, {user.name}.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        {memberships.map((membership) => (
          <div
            key={membership.id}
            className="rounded-xl border p-6"
          >
            <h2 className="text-xl font-semibold">
              {membership.restaurant.name}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {membership.restaurant.city}
            </p>

            <div className="mt-4 flex gap-2">
              <span className="rounded-md bg-muted px-2 py-1 text-xs">
                {membership.role}
              </span>

              <span className="rounded-md bg-muted px-2 py-1 text-xs">
                {membership.restaurant.isApproved
                  ? "Approved"
                  : "Pending approval"}
              </span>
            </div>

            <Link
              href={`/restaurant/${membership.restaurant.id}`}
              className="mt-5 inline-block rounded-md border px-4 py-2 text-sm"
            >
              Manage restaurant
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}