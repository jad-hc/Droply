import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export default async function DriverDeliveriesPage() {
  const user =
    await requireRole(
      UserRole.DRIVER
    );

  const driver =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (
    !driver ||
    !driver.isApproved
  ) {
    return (
      <main className="p-10">
        Driver account is not approved.
      </main>
    );
  }

  const deliveries =
    await prisma.order.findMany({
      where: {
        driverId: driver.id,

        status: {
          in: [
            "DELIVERED",
            "CANCELLED",
          ],
        },
      },

      orderBy: {
        updatedAt: "desc",
      },

      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            city: true,
            area: true,
          },
        },
      },
    });

  const deliveredCount =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
        "DELIVERED"
    ).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Delivery History
          </h1>

          <p className="mt-2 text-muted-foreground">
            {deliveredCount} completed
            deliveries
          </p>
        </div>

        <Link
          href="/driver"
          className="rounded-md border px-4 py-2"
        >
          Driver Dashboard
        </Link>
      </div>

      {deliveries.length === 0 ? (
        <div className="mt-8 rounded-xl border p-10 text-center text-muted-foreground">
          You haven't completed
          any deliveries yet.
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {deliveries.map(
            (delivery) => (
              <div
                key={delivery.id}
                className="rounded-xl border p-5"
              >
                <div className="flex flex-wrap justify-between gap-5">
                  <div>
                    <h2 className="font-semibold">
                      {
                        delivery
                          .restaurant
                          .name
                      }
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Pickup:{" "}
                      {
                        delivery
                          .restaurant
                          .address
                      }
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Delivered to:{" "}
                      {
                        delivery.deliveryAddress
                      }
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-muted px-3 py-1 text-sm">
                      {
                        delivery.status
                      }
                    </span>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {delivery.updatedAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}