import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { EditCategoryForm } from "./edit-category-form";

type Props = {
  params: Promise<{
    restaurantId: string;
    categoryId: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: Props) {
  const { restaurantId, categoryId } = await params;

  await requireRestaurantAccess(restaurantId);

  const category = await prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Edit Category
      </h1>

      <div className="mt-8">
        <EditCategoryForm
          restaurantId={restaurantId}
          category={category}
        />
      </div>
    </main>
  );
}