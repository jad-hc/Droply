"use server";

import { redirect } from "next/navigation";
import slugify from "slugify";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { createRestaurantSchema } from "@/validations/restaurant";
import {
  RestaurantMemberRole,
  UserRole,
} from "@/app/generated/prisma/client";

export type RestaurantActionState = {
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
  };
};

export async function createRestaurantAction(
  previousState: RestaurantActionState,
  formData: FormData
): Promise<RestaurantActionState> {
  const user = await requireUser();

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
    area: formData.get("area"),
  };

  const result = createRestaurantSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data;

  const baseSlug = slugify(data.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.restaurant.findUnique({
      where: { slug },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        area: data.area || null,

        ownerId: user.id,

        isApproved: false,
        isActive: false,
      },
    });

    await tx.restaurantMember.create({
      data: {
        restaurantId: restaurant.id,
        userId: user.id,
        role: RestaurantMemberRole.OWNER,
      },
    });

    if (!user.roles.includes(UserRole.RESTAURANT_OWNER)) {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          roles: {
            push: UserRole.RESTAURANT_OWNER,
          },
        },
      });
    }
  });

  redirect("/restaurant");
}