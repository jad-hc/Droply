import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

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
    </main>
  );
}