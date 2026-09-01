"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export async function setDriverAvailability(
  status: "AVAILABLE" | "OFFLINE"
) {
  const user =
    await requireRole(
      UserRole.DRIVER
    );

  const profile =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
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

  if (profile.status === "BUSY") {
    throw new Error(
      "You cannot go offline while delivering an order."
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
  const user =
    await requireRole(
      UserRole.DRIVER
    );

  const driver =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (
    !driver ||
    !driver.isApproved ||
    driver.status !== "AVAILABLE"
  ) {
    throw new Error(
      "You are not available for deliveries."
    );
  }

  await prisma.$transaction(async (tx) => {
    const claimed =
      await tx.order.updateMany({
        where: {
          id: orderId,
          status:
            "READY_FOR_PICKUP",
          driverId:
            null,
        },

        data: {
          driverId:
            driver.id,

          status:
            "DRIVER_ASSIGNED",
        },
      });

    if (claimed.count !== 1) {
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
  });

  revalidatePath("/driver");
}


export async function updateDeliveryStatus(
  orderId: string,
  newStatus:
    | "PICKED_UP"
    | "ON_THE_WAY"
    | "DELIVERED"
) {
  const user =
    await requireRole(
      UserRole.DRIVER
    );

  const driver =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (!driver) {
    throw new Error(
      "Driver not found."
    );
  }

  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        driverId: driver.id,
      },
    });

  if (!order) {
    throw new Error(
      "Delivery not found."
    );
  }

  const transitions = {
    DRIVER_ASSIGNED:
      "PICKED_UP",

    PICKED_UP:
      "ON_THE_WAY",

    ON_THE_WAY:
      "DELIVERED",
  } as const;

  const expected =
    transitions[
      order.status as keyof typeof transitions
    ];

  if (expected !== newStatus) {
    throw new Error(
      `Cannot change ${order.status} to ${newStatus}.`
    );
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: {
          id: order.id,
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
    }
  );

  revalidatePath("/driver");
}