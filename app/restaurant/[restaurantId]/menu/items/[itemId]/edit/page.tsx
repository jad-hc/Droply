import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { EditMenuItemForm } from "./edit-menu-item-form";

type Props = {
  params: Promise<{
    restaurantId: string;
    itemId: string;
  }>;
};

export default async function EditMenuItemPage({
  params,
}: Props) {
  const { restaurantId, itemId } = await params;

  await requireRestaurantAccess(restaurantId);

  const [item, categories] = await Promise.all([
    prisma.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId,
      },
    }),

    prisma.menuCategory.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Edit Menu Item
      </h1>

      <div className="mt-8">
        <EditMenuItemForm
          restaurantId={restaurantId}
          item={item}
          categories={categories}
        />
      </div>
    </main>
  );
}