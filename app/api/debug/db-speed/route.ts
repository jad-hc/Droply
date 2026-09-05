import {
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  const start =
    performance.now();

  await prisma.order.count();

  const end =
    performance.now();

  return NextResponse.json({
    databaseMs:
      Math.round(end - start),
  });
}