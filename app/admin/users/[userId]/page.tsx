import Link from "next/link";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

import { suspendUser, reactivateUser } from "../actions";

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole(UserRole.ADMIN);

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      roles: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const [orderCount, addressCount] = await Promise.all([
    prisma.order.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.address.count({
      where: {
        userId: user.id,
      },
    }),
  ]);

  const isAdmin = user.roles.includes(UserRole.ADMIN);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/users"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to users
          </Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {user.name}
          </h1>

          <p className="mt-1 text-muted-foreground">
            {user.email}
          </p>
        </div>

        {!isAdmin &&
          (user.isActive ? (
            <form action={suspendUser.bind(null, user.id)}>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Suspend User
              </button>
            </form>
          ) : (
            <form action={reactivateUser.bind(null, user.id)}>
              <button
                type="submit"
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white"
              >
                Reactivate User
              </button>
            </form>
          ))}
      </div>

      {/* Account overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Account Status
          </p>

          <p className="mt-2 text-xl font-semibold">
            {user.isActive ? "Active" : "Suspended"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Orders
          </p>

          <p className="mt-2 text-xl font-semibold">
            {orderCount}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Addresses
          </p>

          <p className="mt-2 text-xl font-semibold">
            {addressCount}
          </p>
        </div>
      </div>

      {/* User information */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            User Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Name
            </p>

            <p className="mt-1 font-medium">
              {user.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p className="mt-1 font-medium">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Phone
            </p>

            <p className="mt-1 font-medium">
              {user.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Joined
            </p>

            <p className="mt-1 font-medium">
              {user.createdAt.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Last Updated
            </p>

            <p className="mt-1 font-medium">
              {user.updatedAt.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="mt-1 font-medium">
              {user.isActive ? "Active" : "Suspended"}
            </p>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            Roles
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 p-6">
          {user.roles.map((role) => (
            <span
              key={role}
              className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium"
            >
              {role.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Security note */}
      {isAdmin && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          This is an administrator account. Administrator accounts
          cannot be suspended through User Administration.
        </div>
      )}
    </div>
  );
}
