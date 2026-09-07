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
    // Added the missing error definitions for the new fields
    deliveryRadiusKm?: string[];
    baseDeliveryFee?: string[];
    deliveryFeePerKm?: string[];
    minimumOrder?: string[];
  };
};

export async function updateRestaurantSettings(
  restaurantId: string,
  previousState: RestaurantSettingsState,
  formData: FormData
): Promise<RestaurantSettingsState> {
  // TIP: If it's still taking 3.4 seconds, wrap this in console.time("auth") to test it
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
    // Added the missing fields from FormData
    deliveryRadiusKm: formData.get("deliveryRadiusKm"),
    minimumOrder: formData.get("minimumOrder"),
    baseDeliveryFee: formData.get("baseDeliveryFee"),
    deliveryFeePerKm: formData.get("deliveryFeePerKm"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  // TIP: If auth is fast, wrap this in console.time("prisma") to test database speed
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
      latitude: data.latitude,
      longitude: data.longitude,
      // Pass the successfully parsed data to Prisma
      deliveryRadiusKm: data.deliveryRadiusKm,
      minimumOrder: data.minimumOrder,
      baseDeliveryFee: data.baseDeliveryFee,
      deliveryFeePerKm: data.deliveryFeePerKm,
    },
  });

  // TIP: If Prisma and Auth are both fast, these revalidations are causing your 3.4s delay!
  revalidatePath(`/restaurant/${restaurantId}`);
  revalidatePath(`/restaurant/${restaurantId}/settings`);

  return {
    success: true,
    message: "Restaurant settings updated.",
  };
}