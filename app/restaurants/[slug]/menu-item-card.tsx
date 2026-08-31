import Link from "next/link";

type Props = {
  restaurantSlug: string;

  item: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    isFeatured: boolean;
    hasOptions: boolean;
  };
};

export function MenuItemCard({
  item,
  restaurantSlug,
}: Props) {
  return (
    <Link
      href={`/restaurants/${restaurantSlug}/items/${item.id}`}
      className="group flex overflow-hidden rounded-xl border transition hover:shadow-md"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
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
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          <p className="font-semibold">
            ${item.price.toFixed(2)}
          </p>

          {item.hasOptions && (
            <p className="mt-1 text-xs text-muted-foreground">
              Customizable
            </p>
          )}
        </div>
      </div>

      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="h-40 w-40 object-cover"
        />
      )}
    </Link>
  );
}