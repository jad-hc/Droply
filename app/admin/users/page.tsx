import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

import { suspendUser, reactivateUser } from "./actions";

type SearchParams = {
  q?: string;
  page?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole(UserRole.ADMIN);

  const params = await searchParams;

  const q = params.q?.trim() || "";
  const page = Math.max(Number(params.page) || 1, 1);
  const pageSize = 20;

  const where = q
    ? {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
          {
            phone: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const [users, totalUsers, activeUsers, suspendedUsers] =
    await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roles: true,
          isActive: true,
          createdAt: true,
        },
      }),

      prisma.user.count({
        where,
      }),

      prisma.user.count({
        where: {
          ...where,
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          ...where,
          isActive: false,
        },
      }),
    ]);

  const totalPages = Math.max(Math.ceil(totalUsers / pageSize), 1);

  function pageUrl(nextPage: number) {
    const search = new URLSearchParams();

    if (q) {
      search.set("q", q);
    }

    search.set("page", String(nextPage));

    return `/admin/users?${search.toString()}`;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          User Administration
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage customer accounts and platform users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Matching Users
          </p>

          <p className="mt-2 text-3xl font-bold">
            {totalUsers}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Active
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeUsers}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Suspended
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {suspendedUsers}
          </p>
        </div>
      </div>

      {/* Search */}
      <form
        method="GET"
        className="flex gap-3"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, email or phone..."
          className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          className="rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>

        {q && (
          <Link
            href="/admin/users"
            className="flex items-center rounded-md border px-4 text-sm font-medium"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Users */}
      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  User
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Phone
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Roles
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Joined
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {users.map((user) => {
                const isAdmin = user.roles.includes(UserRole.ADMIN);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.name}
                      </Link>

                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {user.phone || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="rounded-full bg-muted px-2 py-1 text-xs"
                          >
                            {role.replaceAll("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {user.isActive ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-md border px-3 py-2 text-xs font-medium"
                        >
                          View
                        </Link>

                        {!isAdmin &&
                          (user.isActive ? (
                            <form action={suspendUser.bind(null, user.id)}>
                              <button
                                type="submit"
                                className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Suspend
                              </button>
                            </form>
                          ) : (
                            <form
                              action={reactivateUser.bind(
                                null,
                                user.id
                              )}
                            >
                              <button
                                type="submit"
                                className="rounded-md border border-green-200 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50"
                              >
                                Reactivate
                              </button>
                            </form>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No users found.
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
              href={pageUrl(page - 1)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Previous
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={pageUrl(page + 1)}
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
