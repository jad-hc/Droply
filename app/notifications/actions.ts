"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function markNotificationRead(
  notificationId: string,
  formData: FormData
) {
  const user = await requireUser();

  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },

      select: {
        id: true,
      },
    });

  if (!notification) {
    throw new Error(
      "Notification not found."
    );
  }

  await prisma.notification.update({
    where: {
      id: notification.id,
    },

    data: {
      isRead: true,
    },
  });

  const href =
    formData.get("href");

  revalidatePath(
    "/notifications"
  );

  if (
    typeof href === "string" &&
    href.startsWith("/")
  ) {
    redirect(href);
  }
}

export async function markAllNotificationsRead() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false,
    },

    data: {
      isRead: true,
    },
  });

  revalidatePath(
    "/notifications"
  );
}