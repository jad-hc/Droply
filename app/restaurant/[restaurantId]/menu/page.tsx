import { requireRestaurantAccess } from "@/lib/restaurant-access";
import prisma from "@/lib/prisma";

import { CategoryForm } from "./category-form";
import { DeleteCategoryButton } from "./delete-category-button";

import { MenuItemForm } from "./menu-item-form";
import { DeleteMenuItemButton } from "./delete-menu-item-button";

type Props = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantMenuPage({
  params,
}: Props) {
  const { restaurantId } = await params;

  const { restaurant } =
    await requireRestaurantAccess(restaurantId);

  const categories =
  await prisma.menuCategory.findMany({
    where: {
      restaurantId,
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],

    include: {
      items: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {restaurant.name} Menu
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage categories and menu items.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        <CategoryForm
          restaurantId={restaurantId}
        />

        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Categories
          </h2>

          {categories.length === 0 ? (
            <div className="rounded-xl border p-8 text-center text-muted-foreground">
              No categories yet.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map(
                (category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-xl border p-5"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {category.name}
                      </h3>

                      {category.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            category.description
                          }
                        </p>
                      )}

                    <p className="mt-2 text-xs text-muted-foreground">
                        {category.items.length} {category.items.length === 1 ? "item" : "items"}
                    </p>
                    </div>

                    <div className="flex gap-4">
                      <button className="text-sm">
                        Edit
                      </button>

                      <DeleteCategoryButton
                        restaurantId={
                          restaurantId
                        }
                        categoryId={
                          category.id
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
        <div className="mt-12">
  <MenuItemForm
    restaurantId={restaurantId}
    categories={categories.map(
      (category) => ({
        id: category.id,
        name: category.name,
      })
    )}
  />
</div>

    <div className="mt-12 space-y-8">
  {categories.map((category) => (
    <section key={category.id}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          {category.name}
        </h2>

        <p className="text-sm text-muted-foreground">
          {category.items.length} items
        </p>
      </div>

      {category.items.length === 0 ? (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          No menu items in this category yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {category.items.map(
            (item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {
                            item.description
                          }
                        </p>
                      )}
                    </div>

                    <strong>
                      $
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <span className="rounded bg-muted px-2 py-1 text-xs">
                      {item.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>

                    {item.isFeatured && (
                      <span className="rounded bg-muted px-2 py-1 text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        {/* status badges */}
                    </div>

                    <DeleteMenuItemButton
                        restaurantId={restaurantId}
                        itemId={item.id}
                    />
                    </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  ))}
</div>
      </div>
    </main>
  );
}