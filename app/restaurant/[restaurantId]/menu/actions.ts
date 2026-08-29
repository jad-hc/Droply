"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { menuCategorySchema } from "@/validations/menu-category";

import { menuItemSchema } from "@/validations/menu-item";

export type MenuCategoryState = {
  success: boolean;
  message?: string;

  errors?: {
    name?: string[];
    description?: string[];
    sortOrder?: string[];
  };
};

export async function createMenuCategory(
  restaurantId: string,
  previousState: MenuCategoryState,
  formData: FormData
): Promise<MenuCategoryState> {
  await requireRestaurantAccess(restaurantId);

  const result = menuCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.menuCategory.create({
      data: {
        restaurantId,
        name: result.data.name,
        description: result.data.description || null,
        sortOrder: result.data.sortOrder,
      },
    });

    revalidatePath(`/restaurant/${restaurantId}/menu`);

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch {
    return {
      success: false,
      message:
        "A category with this name may already exist.",
    };
  }
}

export async function deleteMenuCategory(
  restaurantId: string,
  categoryId: string
) {
  await requireRestaurantAccess(restaurantId);

  const category =
    await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
    });

  if (!category) {
    throw new Error("Category not found.");
  }

  await prisma.menuCategory.delete({
    where: {
      id: categoryId,
    },
  });

  revalidatePath(`/restaurant/${restaurantId}/menu`);
}


export type MenuItemState = {
  success: boolean;
  message?: string;

  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    categoryId?: string[];
    image?: string[];
    isAvailable?: string[];
    isFeatured?: string[];
  };
};

export async function createMenuItem(
  restaurantId: string,
  previousState: MenuItemState,
  formData: FormData
): Promise<MenuItemState> {
  await requireRestaurantAccess(restaurantId);

  const result = menuItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    image: formData.get("image"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const category = await prisma.menuCategory.findFirst({
    where: {
      id: result.data.categoryId,
      restaurantId,
    },
  });

  if (!category) {
    return {
      success: false,
      message: "Invalid category.",
    };
  }

  await prisma.menuItem.create({
    data: {
      restaurantId,

      categoryId: result.data.categoryId,

      name: result.data.name,

      description:
        result.data.description || null,

      price: result.data.price,

      image:
        result.data.image || null,

      isAvailable:
        result.data.isAvailable,

      isFeatured:
        result.data.isFeatured,
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/menu`
  );

  return {
    success: true,
    message: "Menu item created successfully.",
  };
}


export async function deleteMenuItem(
  restaurantId: string,
  itemId: string
) {
  await requireRestaurantAccess(
    restaurantId
  );

  const item =
    await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        restaurantId,
      },
    });

  if (!item) {
    throw new Error(
      "Menu item not found."
    );
  }

  await prisma.menuItem.delete({
    where: {
      id: itemId,
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/menu`
  );
}