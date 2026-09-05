"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";

export async function updateRestaurantOrderStatus(
  restaurantId: string,
  orderId: string,
  newStatus:
    | "RESTAURANT_ACCEPTED"
    | "PREPARING"
    | "READY_FOR_PICKUP"
    | "CANCELLED"
) {
  await requireRestaurantAccess(restaurantId);

  const allowedCurrentStatuses:
    | ["PENDING"]
    | ["RESTAURANT_ACCEPTED"]
    | ["PREPARING"]
    | ["PENDING", "RESTAURANT_ACCEPTED"] =
    newStatus === "RESTAURANT_ACCEPTED"
      ? ["PENDING"]
      : newStatus === "PREPARING"
        ? ["RESTAURANT_ACCEPTED"]
        : newStatus === "READY_FOR_PICKUP"
          ? ["PREPARING"]
          : ["PENDING", "RESTAURANT_ACCEPTED"];

  const updated = await prisma.order.updateMany({
    where: {
      id: orderId,
      restaurantId,

      status: {
        in: allowedCurrentStatuses,
      },
    },

    data: {
      status: newStatus,
    },
  });

  if (updated.count !== 1) {
    throw new Error(
      "Order status changed or this transition is no longer valid."
    );
  }

  revalidatePath(
    `/restaurant/${restaurantId}/orders`
  );

  revalidatePath(
    `/orders/${orderId}`
  );

  revalidatePath("/driver");
}