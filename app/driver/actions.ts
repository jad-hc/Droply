"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";
import { createNotification } from "@/lib/notifications";

export async function setDriverAvailability(
  status: "AVAILABLE" | "OFFLINE"
) {
  const user = await requireRole(
    UserRole.DRIVER
  );

  const profile =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
        isApproved: true,
        status: true,
      },
    });

  if (
    !profile ||
    !profile.isApproved
  ) {
    throw new Error(
      "Driver is not approved."
    );
  }

  if (
    profile.status === "BUSY"
  ) {
    throw new Error(
      "You cannot change availability while delivering an order."
    );
  }

  await prisma.driverProfile.update({
    where: {
      id: profile.id,
    },

    data: {
      status,
    },
  });

  revalidatePath("/driver");
}

export async function acceptDelivery(
  orderId: string
) {
  const user = await requireRole(
    UserRole.DRIVER
  );

  const driver =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
        isApproved: true,
        status: true,

        user: {
          select: {
            name: true,
          },
        },
      },
    });

  if (
    !driver ||
    !driver.isApproved
  ) {
    throw new Error(
      "Approved driver account required."
    );
  }

  if (
    driver.status !==
    "AVAILABLE"
  ) {
    throw new Error(
      "You are not available for deliveries."
    );
  }

  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        status:
          "READY_FOR_PICKUP",
        driverId: null,
      },

      select: {
        id: true,
        userId: true,
      },
    });

  if (!order) {
    throw new Error(
      "Delivery is no longer available."
    );
  }

  await prisma.$transaction(
    async (tx) => {
      // Atomic claim:
      // only one driver can take this order.
      const claimed =
        await tx.order.updateMany({
          where: {
            id: orderId,
            status:
              "READY_FOR_PICKUP",
            driverId: null,
          },

          data: {
            driverId:
              driver.id,

            status:
              "DRIVER_ASSIGNED",
          },
        });

      if (
        claimed.count !== 1
      ) {
        throw new Error(
          "This delivery has already been taken."
        );
      }

      await tx.driverProfile.update({
        where: {
          id: driver.id,
        },

        data: {
          status: "BUSY",
        },
      });
    },
    {
      timeout: 5000,
    }
  );

  await createNotification({
    userId: order.userId,

    title:
      "Driver assigned",

    message:
      `${driver.user.name} has accepted your delivery.`,

    href:
      `/orders/${orderId}`,

    type:
      "DELIVERY",
  });

  revalidatePath("/driver");

  revalidatePath(
    `/orders/${orderId}`
  );

  revalidatePath("/orders");

  revalidatePath(
    "/notifications"
  );
}

export async function updateDeliveryStatus(
  orderId: string,
  newStatus:
    | "PICKED_UP"
    | "ON_THE_WAY"
    | "DELIVERED"
) {
  const user = await requireRole(
    UserRole.DRIVER
  );

  const driver =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
        isApproved: true,
      },
    });

  if (
    !driver ||
    !driver.isApproved
  ) {
    throw new Error(
      "Approved driver account required."
    );
  }

  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: driver.id,
      },

      select: {
        id: true,
        userId: true,
        paymentMethod: true,
      },
    });

  if (!order) {
    throw new Error(
      "Delivery not found."
    );
  }

  const transitionMap = {
    PICKED_UP: {
      requiredCurrentStatus:
        "DRIVER_ASSIGNED",
    },

    ON_THE_WAY: {
      requiredCurrentStatus:
        "PICKED_UP",
    },

    DELIVERED: {
      requiredCurrentStatus:
        "ON_THE_WAY",
    },
  } as const;

  const requiredStatus =
    transitionMap[newStatus]
      .requiredCurrentStatus;

  await prisma.$transaction(
    async (tx) => {
      const updated =
        await tx.order.updateMany({
          where: {
            id: orderId,

            driverId:
              driver.id,

            status:
              requiredStatus,
          },

          data: {
            status:
              newStatus,

            ...(newStatus ===
              "DELIVERED" &&
            order.paymentMethod ===
              "CASH"
              ? {
                  paymentStatus:
                    "PAID",
                }
              : {}),
          },
        });

      if (
        updated.count !== 1
      ) {
        throw new Error(
          "Delivery status changed or this transition is no longer valid."
        );
      }

      if (
        newStatus ===
        "DELIVERED"
      ) {
        await tx.driverProfile.update({
          where: {
            id: driver.id,
          },

          data: {
            status:
              "AVAILABLE",
          },
        });
      }
    },
    {
      timeout: 5000,
    }
  );

  if (
    newStatus ===
    "PICKED_UP"
  ) {
    await createNotification({
      userId:
        order.userId,

      title:
        "Order picked up",

      message:
        "Your driver has picked up your order.",

      href:
        `/orders/${orderId}`,

      type:
        "DELIVERY",
    });
  }

  if (
    newStatus ===
    "ON_THE_WAY"
  ) {
    await createNotification({
      userId:
        order.userId,

      title:
        "Driver is on the way",

      message:
        "Your order is on the way.",

      href:
        `/orders/${orderId}`,

      type:
        "DELIVERY",
    });
  }

  if (
    newStatus ===
    "DELIVERED"
  ) {
    await createNotification({
      userId:
        order.userId,

      title:
        "Order delivered",

      message:
        "Your order has been delivered successfully.",

      href:
        `/orders/${orderId}`,

      type:
        "DELIVERY",
    });
  }

  revalidatePath("/driver");

  revalidatePath(
    "/driver/deliveries"
  );

  revalidatePath(
    `/orders/${orderId}`
  );

  revalidatePath("/orders");

  revalidatePath(
    "/notifications"
  );
}