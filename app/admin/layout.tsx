import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(UserRole.ADMIN);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-background md:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b px-6 py-5">
              <Link href="/admin" className="text-xl font-bold">
                Food Delivery
              </Link>

              <p className="mt-1 text-sm text-muted-foreground">
                Admin Panel
              </p>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              <Link
                href="/admin"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/restaurants"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Restaurants
              </Link>

              <Link
                href="/admin/drivers"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Drivers
              </Link>

              <Link
                href="/admin/users"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Customers
              </Link>

              <Link
                href="/admin/orders"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Orders
              </Link>

              <Link
                href="/admin/reviews"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Reviews
              </Link>

              <Link
                href="/admin/settings"
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Settings
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          <header className="flex h-16 items-center border-b bg-background px-6">
            <div>
              <h1 className="font-semibold">Admin Panel</h1>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}