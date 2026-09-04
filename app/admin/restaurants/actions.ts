"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export async function approveRestaurant(
  restaurantId: string
) {
  await requireRole(UserRole.ADMIN);

  const restaurant =
    await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },

      select: {
        id: true,
      },
    });

  if (!restaurant) {
    throw new Error(
      "Restaurant not found."
    );
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },

    data: {
      isApproved: true,
      isActive: true,
    },
  });

  revalidatePath(
    "/admin/restaurants"
  );

  revalidatePath(
    "/restaurants"
  );
}

export async function suspendRestaurant(
  restaurantId: string
) {
  await requireRole(UserRole.ADMIN);

  const restaurant =
    await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },

      select: {
        id: true,
      },
    });

  if (!restaurant) {
    throw new Error(
      "Restaurant not found."
    );
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },

    data: {
      isActive: false,
    },
  });

  revalidatePath(
    "/admin/restaurants"
  );

  revalidatePath(
    "/restaurants"
  );
}

export async function reactivateRestaurant(
  restaurantId: string
) {
  await requireRole(UserRole.ADMIN);

  const restaurant =
    await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },

      select: {
        id: true,
        isApproved: true,
      },
    });

  if (!restaurant) {
    throw new Error(
      "Restaurant not found."
    );
  }

  if (!restaurant.isApproved) {
    throw new Error(
      "Approve the restaurant before activating it."
    );
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },

    data: {
      isActive: true,
    },
  });

  revalidatePath(
    "/admin/restaurants"
  );

  revalidatePath(
    "/restaurants"
  );
}