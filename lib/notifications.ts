import prisma from "@/lib/prisma";
import {
  NotificationType,
} from "@/app/generated/prisma/client";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  href?: string;
  type?: NotificationType;
};

export async function createNotification({
  userId,
  title,
  message,
  href,
  type = NotificationType.SYSTEM,
}: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      href,
      type,
    },
  });
}

/*And a helper for multiple users: */

export async function createNotifications(
  notifications: CreateNotificationInput[]
) {
  if (notifications.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: notifications.map(
      (notification) => ({
        userId:
          notification.userId,

        title:
          notification.title,

        message:
          notification.message,

        href:
          notification.href,

        type:
          notification.type ??
          NotificationType.SYSTEM,
      })
    ),
  });
}