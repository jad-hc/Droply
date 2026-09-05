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

/* */
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
            "DELIVERED"
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
          "Delivery status changed or the delivery does not belong to you."
        );
      }

      if (
        newStatus ===
        "DELIVERED"
      ) {
        await tx.driverProfile.update({
          where: {
            id:
              driver.id,
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

  revalidatePath(
    "/driver"
  );

  revalidatePath(
    `/orders/${orderId}`
  );
}