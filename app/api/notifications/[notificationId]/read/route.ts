import {
  NextRequest,
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

type Props = {
  params: Promise<{
    notificationId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    const user = await requireUser();

    const { notificationId } =
      await params;

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
      return NextResponse.json(
        {
          message:
            "Notification not found.",
        },
        {
          status: 404,
        }
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

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to update notification.",
      },
      {
        status: 500,
      }
    );
  }
}