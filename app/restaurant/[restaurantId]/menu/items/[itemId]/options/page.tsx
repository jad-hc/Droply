import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";

import { OptionGroupForm } from "./option-group-form";
import { OptionForm } from "./option-form";

type Props = {
  params: Promise<{
    restaurantId: string;
    itemId: string;
  }>;
};

export default async function ItemOptionsPage({
  params,
}: Props) {
  const { restaurantId, itemId } = await params;

  await requireRestaurantAccess(restaurantId);

  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      restaurantId,
    },

    include: {
      optionGroups: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">
          {item.name} Options
        </h1>

        <p className="mt-2 text-muted-foreground">
          Create sizes, extras, sauces and other choices.
        </p>
      </div>

      <div className="mt-8">
        <OptionGroupForm
          restaurantId={restaurantId}
          itemId={itemId}
        />
      </div>

      <div className="mt-10 space-y-5">
        {item.optionGroups.map((group) => (
  <div
    key={group.id}
    className="rounded-xl border p-5"
  >
    <div className="flex justify-between gap-4">
      <div>
        <h2 className="font-semibold">
          {group.name}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {group.required ? "Required" : "Optional"} · Choose{" "}
          {group.minSelect}–{group.maxSelect}
        </p>
      </div>

      <span className="text-sm text-muted-foreground">
        {group.options.length} options
      </span>
    </div>

    <div className="mt-5 space-y-2">
      {group.options.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
        >
          <span>{option.name}</span>

          <span className="text-sm">
            +${Number(option.priceAdjustment).toFixed(2)}
          </span>
        </div>
      ))}
    </div>

    <OptionForm
      restaurantId={restaurantId}
      itemId={itemId}
      optionGroupId={group.id}
    />
  </div>
))}

        {item.optionGroups.length === 0 && (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            No option groups yet.
          </div>
        )}
      </div>
    </main>
  );
}
