"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";
import {
  OrderStatus,
} from "@/app/generated/prisma/client";
import {
  createNotification,
  createNotifications,
} from "@/lib/notifications";

type RestaurantOrderActionStatus =
  | "RESTAURANT_ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "CANCELLED";

export async function updateRestaurantOrderStatus(
  restaurantId: string,
  orderId: string,
  newStatus: RestaurantOrderActionStatus
) {
  await requireRestaurantAccess(restaurantId);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      restaurantId,
    },

    select: {
      id: true,
      userId: true,
      status: true,

      restaurant: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  const allowedCurrentStatuses: OrderStatus[] =
  newStatus === "RESTAURANT_ACCEPTED"
    ? [OrderStatus.PENDING]
    : newStatus === "PREPARING"
      ? [OrderStatus.RESTAURANT_ACCEPTED]
      : newStatus === "READY_FOR_PICKUP"
        ? [OrderStatus.PREPARING]
        : [
            OrderStatus.PENDING,
            OrderStatus.RESTAURANT_ACCEPTED,
          ];

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

  // ---------------------------------
  // CUSTOMER NOTIFICATIONS
  // ---------------------------------

  if (newStatus === "RESTAURANT_ACCEPTED") {
    await createNotification({
      userId: order.userId,
      title: "Order accepted",
      message: `${order.restaurant.name} accepted your order.`,
      href: `/orders/${orderId}`,
      type: "ORDER",
    });
  }

  if (newStatus === "PREPARING") {
    await createNotification({
      userId: order.userId,
      title: "Order is being prepared",
      message: `${order.restaurant.name} has started preparing your order.`,
      href: `/orders/${orderId}`,
      type: "ORDER",
    });
  }

  if (newStatus === "READY_FOR_PICKUP") {
    await createNotification({
      userId: order.userId,
      title: "Order ready",
      message:
        "Your order is ready and waiting for a driver to pick it up.",
      href: `/orders/${orderId}`,
      type: "ORDER",
    });

    // ---------------------------------
    // DRIVER NOTIFICATIONS
    // ---------------------------------

    const availableDrivers =
      await prisma.driverProfile.findMany({
        where: {
          isApproved: true,
          status: "AVAILABLE",
        },

        select: {
          userId: true,
        },
      });

    await createNotifications(
      availableDrivers.map((driver) => ({
        userId: driver.userId,
        title: "New delivery available",
        message: `${order.restaurant.name} has an order ready for pickup.`,
        href: "/driver",
        type: "DELIVERY",
      }))
    );
  }

  if (newStatus === "CANCELLED") {
    await createNotification({
      userId: order.userId,
      title: "Order cancelled",
      message: `${order.restaurant.name} cancelled your order.`,
      href: `/orders/${orderId}`,
      type: "ORDER",
    });
  }

  // ---------------------------------
  // REVALIDATE AFFECTED PAGES
  // ---------------------------------

  revalidatePath(
    `/restaurant/${restaurantId}/orders`
  );

  revalidatePath(
    `/orders/${orderId}`
  );

  revalidatePath(
    "/orders"
  );

  revalidatePath(
    "/driver"
  );

  revalidatePath(
    "/notifications"
  );
}