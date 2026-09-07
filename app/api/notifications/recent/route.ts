import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();

    const [notifications, unreadCount] =
      await Promise.all([
        prisma.notification.findMany({
          where: {
            userId: user.id,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 10,

          select: {
            id: true,
            title: true,
            message: true,
            href: true,
            type: true,
            isRead: true,
            createdAt: true,
          },
        }),

        prisma.notification.count({
          where: {
            userId: user.id,
            isRead: false,
          },
        }),
      ]);

    return NextResponse.json({
      unreadCount,

      notifications: notifications.map(
        (notification) => ({
          ...notification,
          createdAt:
            notification.createdAt.toISOString(),
        })
      ),
    });
  } catch {
    return NextResponse.json(
      {
        unreadCount: 0,
        notifications: [],
      },
      {
        status: 401,
      }
    );
  }
}
