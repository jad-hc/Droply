"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/app/generated/prisma/client";

export async function suspendUser(userId: string) {
  await requireRole(UserRole.ADMIN);

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      roles: true,
      isActive: true,
    },
  });

  if (!target) {
    throw new Error("User not found.");
  }

  // Never allow an admin account to be suspended here.
  if (target.roles.includes(UserRole.ADMIN)) {
    throw new Error("Admin accounts cannot be suspended.");
  }

  if (!target.isActive) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function reactivateUser(userId: string) {
  await requireRole(UserRole.ADMIN);

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      roles: true,
      isActive: true,
    },
  });

  if (!target) {
    throw new Error("User not found.");
  }

  if (target.roles.includes(UserRole.ADMIN)) {
    throw new Error("Admin accounts do not need reactivation.");
  }

  if (target.isActive) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}
