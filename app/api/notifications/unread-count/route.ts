import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const user =
      await requireUser();

    const unreadCount =
      await prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      });

    return NextResponse.json({
      unreadCount,
    });
  } catch {
    return NextResponse.json(
      {
        unreadCount: 0,
      },
      {
        status: 401,
      }
    );
  }
}