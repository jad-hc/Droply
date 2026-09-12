"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import {
  RestaurantApprovalStatus,
  UserRole,
} from "@/app/generated/prisma/client";

export async function approveRestaurant(restaurantId: string) {
  await requireRole(UserRole.ADMIN);

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      id: true,
      approvalStatus: true,
    },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  if (restaurant.approvalStatus === RestaurantApprovalStatus.APPROVED) {
    return;
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },
    data: {
      approvalStatus: RestaurantApprovalStatus.APPROVED,
      isApproved: true,
      isActive: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/restaurants");
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  revalidatePath("/restaurants");
}

export async function rejectRestaurant(restaurantId: string) {
  await requireRole(UserRole.ADMIN);

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      id: true,
      approvalStatus: true,
    },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },
    data: {
      approvalStatus: RestaurantApprovalStatus.REJECTED,
      isApproved: false,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/restaurants");
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  revalidatePath("/restaurants");
}

export async function reactivateRestaurant(restaurantId: string) {
  await requireRole(UserRole.ADMIN);

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      id: true,
      approvalStatus: true,
    },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  if (restaurant.approvalStatus !== RestaurantApprovalStatus.APPROVED) {
    throw new Error("Only approved restaurants can be reactivated.");
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },
    data: {
      isActive: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/restaurants");
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  revalidatePath("/restaurants");
}

export async function suspendRestaurant(restaurantId: string) {
  await requireRole(UserRole.ADMIN);

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    select: {
      id: true,
      approvalStatus: true,
    },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  if (restaurant.approvalStatus !== RestaurantApprovalStatus.APPROVED) {
    throw new Error("Only approved restaurants can be suspended.");
  }

  await prisma.restaurant.update({
    where: {
      id: restaurantId,
    },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/restaurants");
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  revalidatePath("/restaurants");
}