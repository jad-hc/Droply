import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { SettingsForm } from "./settings-form";

type Props = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantSettingsPage({
  params,
}: Props) {
  const { restaurantId } = await params;

  const { restaurant } =
    await requireRestaurantAccess(
      restaurantId
    );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Restaurant Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage {restaurant.name}.
        </p>
      </div>

      <SettingsForm
        restaurant={restaurant}
      />
    </main>
  );
}