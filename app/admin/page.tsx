import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalRestaurants,
    approvedRestaurants,
    pendingRestaurants,
    totalDrivers,
    approvedDrivers,
    pendingDrivers,
    totalOrders,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.restaurant.count(),

    prisma.restaurant.count({
      where: {
        isApproved: true,
      },
    }),

    prisma.restaurant.count({
      where: {
        isApproved: false,
      },
    }),

    prisma.driverProfile.count(),

    prisma.driverProfile.count({
      where: {
        isApproved: true,
      },
    }),

    prisma.driverProfile.count({
      where: {
        isApproved: false,
      },
    }),

    prisma.order.count(),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
    },
    {
      title: "Restaurants",
      value: totalRestaurants,
    },
    {
      title: "Approved Restaurants",
      value: approvedRestaurants,
    },
    {
      title: "Pending Restaurants",
      value: pendingRestaurants,
    },
    {
      title: "Drivers",
      value: totalDrivers,
    },
    {
      title: "Approved Drivers",
      value: approvedDrivers,
    },
    {
      title: "Pending Drivers",
      value: pendingDrivers,
    },
    {
      title: "Total Orders",
      value: totalOrders,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h2>

        <p className="text-muted-foreground">
          Overview of your food delivery platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border bg-background p-5"
          >
            <p className="text-sm text-muted-foreground">
              {stat.title}
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-background p-6">
          <h3 className="font-semibold">
            Restaurant Applications
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Pending
              </span>

              <span className="font-semibold">
                {pendingRestaurants}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Approved
              </span>

              <div className="mt-4 rounded-2xl bg-red-300 px-3 py-1 text-sm font-medium text-red-900 hover:bg-red-400">
                <Link href="/admin/restaurants">Restaurants</Link>
              </div>

              <span className="font-semibold">
                {approvedRestaurants}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-6">
          <h3 className="font-semibold">
            Driver Applications
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Pending
              </span>
              <span className="font-semibold">
                {pendingDrivers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Approved
              </span>

              <div className="mt-4 rounded-2xl bg-red-300 px-3 py-1 text-sm font-medium text-red-900 hover:bg-red-400">
                <Link href="/admin/drivers">Drivers</Link>
              </div>

              <span className="font-semibold">
                {approvedDrivers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
