"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import { restaurantSettingsSchema } from "@/validations/restaurant-settings";

export type RestaurantSettingsState = {
  success: boolean;
  message?: string;

  errors?: {
    name?: string[];
    description?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    city?: string[];
    area?: string[];
    logo?: string[];
    coverImage?: string[];
    latitude?: string[];
    longitude?: string[];
  };
};

export async function updateRestaurantSettings(
  restaurantId: string,
  previousState: RestaurantSettingsState,
  formData: FormData
): Promise<RestaurantSettingsState> {
  await requireRestaurantAccess(restaurantId);

  const result = restaurantSettingsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    area: formData.get("area"),
    logo: formData.get("logo"),
    coverImage: formData.get("coverImage"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },

    data: {
      name: data.name,
      description: data.description || null,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      city: data.city,
      area: data.area || null,
      logo: data.logo || null,
      coverImage: data.coverImage || null,
      latitude: result.data.latitude,
      longitude: result.data.longitude,
    },
  });

  revalidatePath(`/restaurant/${restaurantId}`);
  revalidatePath(
    `/restaurant/${restaurantId}/settings`
  );

  return {
    success: true,
    message: "Restaurant settings updated.",
  };
}