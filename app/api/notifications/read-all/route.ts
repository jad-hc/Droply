import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST() {
  try {
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

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to update notifications.",
      },
      {
        status: 500,
      }
    );
  }
}
