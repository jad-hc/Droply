import Link from "next/link";

type Props = {
  item: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    isFeatured: boolean;
    hasOptions: boolean;
  };

  restaurantSlug: string;
  restaurantOpen: boolean;
};

export function MenuItemCard({
  item,
  restaurantSlug,
  restaurantOpen,
}: Props) {
  const card = (
    <div
      className={`overflow-hidden rounded-xl border ${
        restaurantOpen
          ? "transition hover:shadow-md"
          : "opacity-60"
      }`}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="h-44 w-full object-cover"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">
                {item.name}
              </h3>

              {item.isFeatured && (
                <span className="rounded bg-muted px-2 py-1 text-xs">
                  Featured
                </span>
              )}
            </div>

            {item.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>

          <span className="font-semibold">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <div className="mt-4">
          {restaurantOpen ? (
            <span className="text-sm font-medium">
              {item.hasOptions
                ? "Customize item →"
                : "View item →"}
            </span>
          ) : (
            <span className="text-sm font-medium text-red-600">
              Restaurant closed
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Don't allow navigation to the item ordering page
  // while the restaurant is closed.
  if (!restaurantOpen) {
    return card;
  }

  return (
    <Link
      href={`/restaurants/${restaurantSlug}/items/${item.id}`}
    >
      {card}
    </Link>
  );
}