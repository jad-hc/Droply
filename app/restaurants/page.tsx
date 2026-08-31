import Link from "next/link";

import prisma from "@/lib/prisma";

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      isActive: true,
      isApproved: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logo: true,
      coverImage: true,
      city: true,
      area: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Restaurants
        </h1>

        <p className="mt-2 text-muted-foreground">
          Discover restaurants and order your favorite food.
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <p className="text-muted-foreground">
            No restaurants are currently available.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.slug}`}
              className="overflow-hidden rounded-xl border transition hover:shadow-md"
            >
              {restaurant.coverImage ? (
                <img
                  src={restaurant.coverImage}
                  alt={restaurant.name}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">
                    No cover image
                  </span>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-3">
                  {restaurant.logo && (
                    <img
                      src={restaurant.logo}
                      alt={`${restaurant.name} logo`}
                      className="h-12 w-12 rounded-lg border object-cover"
                    />
                  )}

                  <div>
                    <h2 className="font-semibold">
                      {restaurant.name}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      {[restaurant.area, restaurant.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                {restaurant.description && (
                  <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                    {restaurant.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}