import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const user = await requireRole(UserRole.ADMIN);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <p className="mt-4">
        Welcome, {user.name}.
      </p>

      <Link
        href="/admin/restaurants"
        className="rounded-xl border p-6"
      >
      <h2 className="font-semibold">
        Restaurants
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Approve and manage restaurant accounts.
      </p>
      </Link>
    </main>
  );
}