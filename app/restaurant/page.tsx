import { requireAnyRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export default async function RestaurantDashboardPage() {
  const user = await requireAnyRole([
    UserRole.RESTAURANT_OWNER,
    UserRole.RESTAURANT_STAFF,
  ]);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Restaurant Dashboard
      </h1>

      <p className="mt-4">
        Welcome, {user.name}.
      </p>
    </main>
  );
}