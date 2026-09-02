import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

import { setDriverAvailability } from "./actions";
import { AcceptDeliveryButton } from "./accept-delivery-button";
import { ActiveDeliveryControls } from "./active-delivery-controls";

import { DriverRealtime } from "./driver-realtime";

export default async function DriverDashboardPage() {
  const user =
    await requireRole(
      UserRole.DRIVER
    );

    function isActiveDeliveryStatus(
  status: string
): status is "DRIVER_ASSIGNED" | "PICKED_UP" | "ON_THE_WAY" {
  return (
    status === "DRIVER_ASSIGNED" ||
    status === "PICKED_UP" ||
    status === "ON_THE_WAY"
  );
}

  const driver =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },

      include: {
        deliveries: {
          where: {
            status: {
              in: [
                "DRIVER_ASSIGNED",
                "PICKED_UP",
                "ON_THE_WAY",
              ],
            },
          },

          include: {
            restaurant: true,
          },
        },
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

  const activeDelivery =
    driver.deliveries[0] ?? null;

  const availableOrders =
    driver.status === "AVAILABLE" &&
    !activeDelivery
      ? await prisma.order.findMany({
          where: {
            status:
              "READY_FOR_PICKUP",

            driverId:
              null,
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

          orderBy: {
            createdAt: "asc",
          },

          take: 20,
        })
      : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <DriverRealtime />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Driver Dashboard
          </h1>

          <p className="mt-2">
            Status:{" "}
            <strong>
              {driver.status}
            </strong>
          </p>
        </div>

        {!activeDelivery && (
          <div className="flex gap-3">
            {driver.status ===
            "OFFLINE" ? (
              <form
                action={setDriverAvailability.bind(
                  null,
                  "AVAILABLE"
                )}
              >
                <button className="rounded-md bg-foreground px-4 py-2 text-background">
                  Go Online
                </button>
              </form>
            ) : (
              <form
                action={setDriverAvailability.bind(
                  null,
                  "OFFLINE"
                )}
              >
                <button className="rounded-md border px-4 py-2">
                  Go Offline
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {activeDelivery ? (
        <section className="mt-10 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Active Delivery
          </h2>

          <p className="mt-4 font-medium">
            {
              activeDelivery
                .restaurant.name
            }
          </p>

          <p className="mt-2 text-sm">
            Pickup:
            {" "}
            {
              activeDelivery
                .restaurant.address
            }
          </p>

          <p className="mt-2 text-sm">
            Deliver to:
            {" "}
            {
              activeDelivery
                .deliveryAddress
            }
          </p>

          <p className="mt-3">
            Status:{" "}
            <strong>
              {
                activeDelivery
                  .status
              }
            </strong>
          </p>

          <div className="mt-6">
            {isActiveDeliveryStatus(activeDelivery.status) && (
              <ActiveDeliveryControls
                orderId={activeDelivery.id}
                status={activeDelivery.status}
              />
            )}
          </div>
        </section>
      ) : (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Available Deliveries
          </h2>

          {driver.status ===
          "OFFLINE" ? (
            <p className="mt-4 text-muted-foreground">
              Go online to see available deliveries.
            </p>
          ) : availableOrders.length ===
            0 ? (
            <p className="mt-4 text-muted-foreground">
              No deliveries available.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {availableOrders.map(
                (order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border p-5"
                  >
                    <h3 className="font-semibold">
                      {
                        order
                          .restaurant
                          .name
                      }
                    </h3>

                    <p className="mt-2 text-sm">
                      Pickup:{" "}
                      {
                        order
                          .restaurant
                          .address
                      }
                    </p>

                    <p className="mt-1 text-sm">
                      Destination:{" "}
                      {
                        order.deliveryAddress
                      }
                    </p>

                    <div className="mt-5">
                      <AcceptDeliveryButton
                        orderId={
                          order.id
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}