import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

import { approveDriver } from "./actions";

export default async function AdminDriversPage() {
  await requireRole(UserRole.ADMIN);

  const drivers =
    await prisma.driverProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Drivers
      </h1>

      <div className="mt-8 space-y-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="flex items-center justify-between rounded-xl border p-5"
          >
            <div>
              <h2 className="font-semibold">
                {driver.user.name}
              </h2>

              <p className="text-sm text-muted-foreground">
                {driver.vehicleType} ·{" "}
                {driver.vehicleModel}
              </p>

              <p className="text-sm text-muted-foreground">
                Plate: {driver.vehiclePlate}
              </p>

              <p className="mt-1 text-sm">
                {driver.isApproved
                  ? "Approved"
                  : "Pending"}
              </p>
            </div>

            {!driver.isApproved && (
              <form
                action={approveDriver.bind(
                  null,
                  driver.id
                )}
              >
                <button className="rounded-md bg-foreground px-4 py-2 text-background">
                  Approve
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}