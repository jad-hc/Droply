import Link from "next/link";

import { requireRestaurantAccess } from "@/lib/restaurant-access";

type Props = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function ManageRestaurantPage({
  params,
}: Props) {
  const { restaurantId } = await params;

  const { restaurant } =
    await requireRestaurantAccess(
      restaurantId
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">
          {restaurant.name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your restaurant.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href={`/restaurant/${restaurant.id}/settings`}
          className="rounded-xl border p-6"
        >
          <h2 className="font-semibold">
            Settings
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Restaurant details and images
          </p>
        </Link>

        <Link
          href={`/restaurant/${restaurant.id}/menu`}
          className="rounded-xl border p-6"
        >
          <h2 className="font-semibold">
            Menu
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Categories and menu items
          </p>
        </Link>

        <div className="rounded-xl border p-6">
          <Link
  href={`/restaurant/${restaurant.id}/orders`}
  className="rounded-xl border p-6"
>
  <h2 className="font-semibold">
    Orders
  </h2>

  <p className="mt-2 text-sm text-muted-foreground">
    Manage incoming orders
  </p>
</Link>
        </div>
      </div>
    </main>
  );
}