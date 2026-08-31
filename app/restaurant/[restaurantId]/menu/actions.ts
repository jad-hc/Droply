"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { menuCategorySchema } from "@/validations/menu-category";

import { menuItemSchema } from "@/validations/menu-item";
import { optionGroupSchema } from "@/validations/menu-option-group";
import { menuItemOptionSchema } from "@/validations/menu-item-option";

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

/*Add category update action */

export async function updateMenuCategory(
  restaurantId: string,
  categoryId: string,
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

  const category = await prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    },
  });

  if (!category) {
    return {
      success: false,
      message: "Category not found.",
    };
  }

  try {
    await prisma.menuCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name: result.data.name,
        description: result.data.description || null,
        sortOrder: result.data.sortOrder,
      },
    });

    revalidatePath(`/restaurant/${restaurantId}/menu`);

    return {
      success: true,
      message: "Category updated.",
    };
  } catch {
    return {
      success: false,
      message: "Unable to update category.",
    };
  }
}

/*Add menu item update action */

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
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

  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      restaurantId,
    },
  });

  if (!item) {
    return {
      success: false,
      message: "Menu item not found.",
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

  await prisma.menuItem.update({
    where: {
      id: itemId,
    },
    data: {
      name: result.data.name,
      description: result.data.description || null,
      price: result.data.price,
      categoryId: result.data.categoryId,
      image: result.data.image || null,
      isAvailable: result.data.isAvailable,
      isFeatured: result.data.isFeatured,
    },
  });

  revalidatePath(`/restaurant/${restaurantId}/menu`);

  return {
    success: true,
    message: "Menu item updated.",
  };
}

/*              */

export type OptionGroupState = {
  success: boolean;
  message?: string;

  errors?: {
    name?: string[];
    required?: string[];
    minSelect?: string[];
    maxSelect?: string[];
  };
};

export async function createOptionGroup(
  restaurantId: string,
  menuItemId: string,
  previousState: OptionGroupState,
  formData: FormData
): Promise<OptionGroupState> {
  await requireRestaurantAccess(restaurantId);

  const result = optionGroupSchema.safeParse({
    name: formData.get("name"),
    required: formData.get("required") === "on",
    minSelect: formData.get("minSelect"),
    maxSelect: formData.get("maxSelect"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const item = await prisma.menuItem.findFirst({
    where: {
      id: menuItemId,
      restaurantId,
    },
  });

  if (!item) {
    return {
      success: false,
      message: "Menu item not found.",
    };
  }

  await prisma.menuItemOptionGroup.create({
    data: {
      menuItemId,
      name: result.data.name,
      required: result.data.required,
      minSelect: result.data.minSelect,
      maxSelect: result.data.maxSelect,
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/menu/items/${menuItemId}/options`
  );

  return {
    success: true,
    message: "Option group created.",
  };
}

/*delete option group action */

export async function deleteOptionGroup(
  restaurantId: string,
  menuItemId: string,
  optionGroupId: string
) {
  await requireRestaurantAccess(restaurantId);

  const group =
    await prisma.menuItemOptionGroup.findFirst({
      where: {
        id: optionGroupId,
        menuItemId,
        menuItem: {
          restaurantId,
        },
      },
    });

  if (!group) {
    throw new Error("Option group not found.");
  }

  await prisma.menuItemOptionGroup.delete({
    where: {
      id: optionGroupId,
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/menu/items/${menuItemId}/options`
  );
}

/*                 */

export type MenuItemOptionState = {
  success: boolean;
  message?: string;

  errors?: {
    name?: string[];
    priceAdjustment?: string[];
  };
};

export async function createMenuItemOption(
  restaurantId: string,
  menuItemId: string,
  optionGroupId: string,
  previousState: MenuItemOptionState,
  formData: FormData
): Promise<MenuItemOptionState> {
  await requireRestaurantAccess(restaurantId);

  const result = menuItemOptionSchema.safeParse({
    name: formData.get("name"),
    priceAdjustment: formData.get("priceAdjustment"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const group =
    await prisma.menuItemOptionGroup.findFirst({
      where: {
        id: optionGroupId,
        menuItemId,
        menuItem: {
          restaurantId,
        },
      },
    });

  if (!group) {
    return {
      success: false,
      message: "Option group not found.",
    };
  }

  await prisma.menuItemOption.create({
    data: {
      optionGroupId,
      name: result.data.name,
      priceAdjustment: result.data.priceAdjustment,
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/menu/items/${menuItemId}/options`
  );

  return {
    success: true,
    message: "Option added.",
  };
}

/*delete*/

export async function deleteMenuItemOption(
  restaurantId: string,
  menuItemId: string,
  optionGroupId: string,
  optionId: string
) {
  await requireRestaurantAccess(restaurantId);

  const option =
    await prisma.menuItemOption.findFirst({
      where: {
        id: optionId,
        optionGroupId,
        optionGroup: {
          menuItemId,
          menuItem: {
            restaurantId,
          },
        },
      },
    });

  if (!option) {
    throw new Error("Option not found.");
  }

  await prisma.menuItemOption.delete({
    where: {
      id: optionId,
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/menu/items/${menuItemId}/options`
  );
}