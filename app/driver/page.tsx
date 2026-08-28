import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export default async function DriverDashboardPage() {
  const user = await requireRole(UserRole.DRIVER);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Driver Dashboard
      </h1>

      <p className="mt-4">
        Welcome, {user.name}.
      </p>
    </main>
  );
}