"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export async function approveDriver(
  driverProfileId: string
) {
  await requireRole(UserRole.ADMIN);

  const profile =
    await prisma.driverProfile.findUnique({
      where: {
        id: driverProfileId,
      },

      include: {
        user: true,
      },
    });

  if (!profile) {
    throw new Error("Driver not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.driverProfile.update({
      where: {
        id: profile.id,
      },

      data: {
        isApproved: true,
      },
    });

    if (
      !profile.user.roles.includes(
        UserRole.DRIVER
      )
    ) {
      await tx.user.update({
        where: {
          id: profile.userId,
        },

        data: {
          roles: {
            push: UserRole.DRIVER,
          },
        },
      });
    }
  });

  revalidatePath("/admin/drivers");
}