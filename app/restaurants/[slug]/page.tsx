import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { MenuItemCard } from "./menu-item-card";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicRestaurantPage({
  params,
}: Props) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },

    include: {
      categories: {
        where: {
          isActive: true,
        },

        orderBy: {
          sortOrder: "asc",
        },

        include: {
          items: {
            where: {
              isAvailable: true,
            },

            orderBy: {
              createdAt: "desc",
            },

            include: {
              optionGroups: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (
    !restaurant ||
    !restaurant.isActive ||
    !restaurant.isApproved
  ) {
    notFound();
  }

  return (
    <main>
      {restaurant.coverImage && (
        <div className="h-72 overflow-hidden">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-start gap-5">
          {restaurant.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="h-24 w-24 rounded-xl border object-cover"
            />
          )}

          <div>
            <h1 className="text-3xl font-bold">
              {restaurant.name}
            </h1>

            {restaurant.description && (
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {restaurant.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {restaurant.area && (
                <span>{restaurant.area}</span>
              )}

              {restaurant.city && (
                <span>{restaurant.city}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {restaurant.categories.map((category) => (
            <section key={category.id}>
              <div className="mb-5">
                <h2 className="text-2xl font-bold">
                  {category.name}
                </h2>

                {category.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>

              {category.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No available items.
                </p>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={{
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        image: item.image,
                        price: Number(item.price),
                        isFeatured: item.isFeatured,
                        hasOptions:
                          item.optionGroups.length > 0,
                      }}
                      restaurantSlug={restaurant.slug}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}