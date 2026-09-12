import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  DriverApprovalStatus,
} from "@/app/generated/prisma/client";
import {
  approveDriver,
  rejectDriver,
  suspendDriver,
  reactivateDriver,
} from "./actions";

export default async function AdminDriversPage() {
  const drivers = await prisma.driverProfile.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  const pendingCount = drivers.filter(
    (driver) =>
      driver.approvalStatus === DriverApprovalStatus.PENDING
  ).length;

  const approvedCount = drivers.filter(
    (driver) =>
      driver.approvalStatus === DriverApprovalStatus.APPROVED
  ).length;

  const rejectedCount = drivers.filter(
    (driver) =>
      driver.approvalStatus === DriverApprovalStatus.REJECTED
  ).length;

  const activeCount = drivers.filter(
    (driver) =>
      driver.approvalStatus === DriverApprovalStatus.APPROVED &&
      driver.isApproved
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Drivers
        </h2>

        <p className="text-muted-foreground">
          Manage driver applications and driver accounts.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Total Drivers
          </p>

          <p className="mt-2 text-3xl font-bold">
            {drivers.length}
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
            Active
          </p>

          <p className="mt-2 text-3xl font-bold">
            {activeCount}
          </p>
        </div>
      </div>

      {/* Driver list */}
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">
            All Drivers
          </h3>
        </div>

        {drivers.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No drivers found.
          </div>
        ) : (
          <div className="divide-y">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                {/* Driver info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">
                      {driver.user.name}
                    </h4>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        driver.approvalStatus ===
                        DriverApprovalStatus.APPROVED
                          ? "bg-green-100 text-green-700"
                          : driver.approvalStatus ===
                              DriverApprovalStatus.REJECTED
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {driver.approvalStatus}
                    </span>

                    {driver.approvalStatus ===
                      DriverApprovalStatus.APPROVED && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          driver.isApproved
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {driver.isApproved
                          ? "ACTIVE"
                          : "SUSPENDED"}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {driver.user.email}
                  </p>

                  {driver.user.phone && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {driver.user.phone}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    Driver status: {driver.status}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/drivers/${driver.id}`}
                    className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    View
                  </Link>

                  {driver.approvalStatus ===
                    DriverApprovalStatus.PENDING && (
                    <>
                      <form
                        action={approveDriver.bind(
                          null,
                          driver.id
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
                        action={rejectDriver.bind(
                          null,
                          driver.id
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

                  {driver.approvalStatus ===
                    DriverApprovalStatus.APPROVED &&
                    driver.isApproved && (
                    <form
                      action={suspendDriver.bind(
                        null,
                        driver.id
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

                  {driver.approvalStatus ===
                    DriverApprovalStatus.APPROVED &&
                    !driver.isApproved && (
                    <form
                      action={reactivateDriver.bind(
                        null,
                        driver.id
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