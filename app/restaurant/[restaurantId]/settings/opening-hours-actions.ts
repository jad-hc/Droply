"use server";

import {
  DayOfWeek,
} from "@/app/generated/prisma/client";

import prisma from "@/lib/prisma";
import { requireRestaurantAccess } from "@/lib/restaurant-access";

import { revalidatePath } from "next/cache";

const DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

function validTime(
  value: string
) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(
    value
  );
}

export async function updateOpeningHours(
  restaurantId: string,
  formData: FormData
) {
  await requireRestaurantAccess(
    restaurantId
  );

  const operations =
    DAYS.map((day) => {
      const isClosed =
        formData.get(
          `${day}-closed`
        ) === "on";

      const openTime =
        String(
          formData.get(
            `${day}-open`
          ) ?? ""
        );

      const closeTime =
        String(
          formData.get(
            `${day}-close`
          ) ?? ""
        );

      if (
        !isClosed &&
        (!validTime(openTime) ||
          !validTime(closeTime))
      ) {
        throw new Error(
          `Invalid opening hours for ${day}.`
        );
      }

      return prisma.restaurantOpeningHour.upsert({
        where: {
          restaurantId_day: {
            restaurantId,
            day,
          },
        },

        update: {
          isClosed,

          openTime:
            isClosed
              ? null
              : openTime,

          closeTime:
            isClosed
              ? null
              : closeTime,
        },

        create: {
          restaurantId,
          day,
          isClosed,

          openTime:
            isClosed
              ? null
              : openTime,

          closeTime:
            isClosed
              ? null
              : closeTime,
        },
      });
    });

  await prisma.$transaction(
    operations
  );

  revalidatePath(
    `/restaurant/${restaurantId}/settings`
  );

  revalidatePath(
    "/restaurants"
  );
}