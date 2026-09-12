"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import {
  DriverApprovalStatus,
  UserRole,
} from "@/app/generated/prisma/client";

export async function approveDriver(driverId: string) {
  await requireRole(UserRole.ADMIN);

  const driver = await prisma.driverProfile.findUnique({
    where: {
      id: driverId,
    },
    select: {
      id: true,
      userId: true,
      approvalStatus: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: driver.userId,
      },
      select: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error("Driver user not found.");
    }

    const roles = user.roles.includes(UserRole.DRIVER)
      ? user.roles
      : [...user.roles, UserRole.DRIVER];

    await tx.user.update({
      where: {
        id: driver.userId,
      },
      data: {
        roles,
      },
    });

    await tx.driverProfile.update({
      where: {
        id: driverId,
      },
      data: {
        approvalStatus: DriverApprovalStatus.APPROVED,
        isApproved: true,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/drivers");
  revalidatePath(`/admin/drivers/${driverId}`);
}

export async function rejectDriver(driverId: string) {
  await requireRole(UserRole.ADMIN);

  const driver = await prisma.driverProfile.findUnique({
    where: {
      id: driverId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: driver.userId,
      },
      select: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error("Driver user not found.");
    }

    const roles = user.roles.filter(
      (role) => role !== UserRole.DRIVER
    );

    await tx.user.update({
      where: {
        id: driver.userId,
      },
      data: {
        roles,
      },
    });

    await tx.driverProfile.update({
      where: {
        id: driverId,
      },
      data: {
        approvalStatus: DriverApprovalStatus.REJECTED,
        isApproved: false,
        status: "OFFLINE",
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/drivers");
  revalidatePath(`/admin/drivers/${driverId}`);
}

export async function suspendDriver(driverId: string) {
  await requireRole(UserRole.ADMIN);

  const driver = await prisma.driverProfile.findUnique({
    where: {
      id: driverId,
    },
    select: {
      id: true,
      userId: true,
      approvalStatus: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
    throw new Error("Only approved drivers can be suspended.");
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: driver.userId,
      },
      select: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error("Driver user not found.");
    }

    await tx.user.update({
      where: {
        id: driver.userId,
      },
      data: {
        roles: user.roles.filter(
          (role) => role !== UserRole.DRIVER
        ),
      },
    });

    await tx.driverProfile.update({
      where: {
        id: driverId,
      },
      data: {
        isApproved: false,
        status: "OFFLINE",
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/drivers");
  revalidatePath(`/admin/drivers/${driverId}`);
}

export async function reactivateDriver(driverId: string) {
  await requireRole(UserRole.ADMIN);

  const driver = await prisma.driverProfile.findUnique({
    where: {
      id: driverId,
    },
    select: {
      id: true,
      userId: true,
      approvalStatus: true,
    },
  });

  if (!driver) {
    throw new Error("Driver not found.");
  }

  if (driver.approvalStatus !== DriverApprovalStatus.APPROVED) {
    throw new Error("Only approved drivers can be reactivated.");
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        id: driver.userId,
      },
      select: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error("Driver user not found.");
    }

    const roles = user.roles.includes(UserRole.DRIVER)
      ? user.roles
      : [...user.roles, UserRole.DRIVER];

    await tx.user.update({
      where: {
        id: driver.userId,
      },
      data: {
        roles,
      },
    });

    await tx.driverProfile.update({
      where: {
        id: driverId,
      },
      data: {
        isApproved: true,
        status: "OFFLINE",
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/drivers");
  revalidatePath(`/admin/drivers/${driverId}`);
}