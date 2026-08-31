"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";

const allowedTransitions = {
  PENDING: [
    "RESTAURANT_ACCEPTED",
    "CANCELLED",
  ],

  RESTAURANT_ACCEPTED: [
    "PREPARING",
    "CANCELLED",
  ],

  PREPARING: [
    "READY_FOR_PICKUP",
  ],

  READY_FOR_PICKUP: [],
} as const;

type RestaurantOrderStatus =
  | "PENDING"
  | "RESTAURANT_ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP";

export async function updateRestaurantOrderStatus(
  restaurantId: string,
  orderId: string,
  newStatus: string
) {
  await requireRestaurantAccess(restaurantId);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      restaurantId,
    },

    select: {
      id: true,
      status: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  const currentStatus =
    order.status as RestaurantOrderStatus;

  if (!(currentStatus in allowedTransitions)) {
    throw new Error(
      "This order can no longer be managed by the restaurant."
    );
  }

  const allowed =
    allowedTransitions[currentStatus];

  if (
    !allowed.includes(
      newStatus as never
    )
  ) {
    throw new Error(
      `Cannot change order from ${currentStatus} to ${newStatus}.`
    );
  }

  await prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status: newStatus as
        | "RESTAURANT_ACCEPTED"
        | "PREPARING"
        | "READY_FOR_PICKUP"
        | "CANCELLED",
    },
  });

  revalidatePath(
    `/restaurant/${restaurantId}/orders`
  );
}