import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";
import { MenuItemCustomizer } from "./menu-item-customizer";

type Props = {
  params: Promise<{
    slug: string;
    itemId: string;
  }>;
};

export default async function MenuItemPage({
  params,
}: Props) {
  const { slug, itemId } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      slug,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      isApproved: true,
    },
  });

  if (
    !restaurant ||
    !restaurant.isActive ||
    !restaurant.isApproved
  ) {
    notFound();
  }

  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      restaurantId: restaurant.id,
      isAvailable: true,
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <MenuItemCustomizer
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        }}
        item={{
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          price: Number(item.price),

          optionGroups: item.optionGroups.map((group) => ({
            id: group.id,
            name: group.name,
            required: group.required,
            minSelect: group.minSelect,
            maxSelect: group.maxSelect,

            options: group.options.map((option) => ({
              id: option.id,
              name: option.name,
              priceAdjustment: Number(
                option.priceAdjustment
              ),
            })),
          })),
        }}
      />
    </main>
  );
}