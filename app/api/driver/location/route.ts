import {
  NextRequest,
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

type LocationBody = {
  orderId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await requireUser();

    const body =
      (await request.json()) as LocationBody;

    if (
      !body.orderId ||
      typeof body.latitude !==
        "number" ||
      typeof body.longitude !==
        "number"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid location data.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        body.latitude
      ) ||
      body.latitude < -90 ||
      body.latitude > 90 ||
      !Number.isFinite(
        body.longitude
      ) ||
      body.longitude < -180 ||
      body.longitude > 180
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid coordinates.",
        },
        {
          status: 400,
        }
      );
    }

    const driver =
      await prisma.driverProfile.findUnique({
        where: {
          userId:
            user.id,
        },

        select: {
          id: true,
          isApproved: true,
        },
      });

    if (
      !driver ||
      !driver.isApproved
    ) {
      return NextResponse.json(
        {
          message:
            "Approved driver account required.",
        },
        {
          status: 403,
        }
      );
    }

    // Verify this order is actually
    // assigned to this driver.
    const order =
      await prisma.order.findFirst({
        where: {
          id:
            body.orderId,

          driverId:
            driver.id,

          status: {
            in: [
              "DRIVER_ASSIGNED",
              "PICKED_UP",
              "ON_THE_WAY",
            ],
          },
        },

        select: {
          id: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          message:
            "Active delivery not found.",
        },
        {
          status: 403,
        }
      );
    }

    await prisma.driverProfile.update({
      where: {
        id:
          driver.id,
      },

      data: {
        currentLatitude:
          body.latitude,

        currentLongitude:
          body.longitude,

        locationUpdatedAt:
          new Date(),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DRIVER LOCATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update location.",
      },
      {
        status: 500,
      }
    );
  }
}