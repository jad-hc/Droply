"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { orderReviewSchema } from "@/validations/review";

export type ReviewState = {
  success: boolean;
  message?: string;

  errors?: {
    restaurantRating?: string[];
    driverRating?: string[];
    restaurantComment?: string[];
    driverComment?: string[];
  };
};

export async function submitOrderReview(
  orderId: string,
  previousState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const user = await requireUser();

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },

    select: {
      id: true,
      status: true,
      restaurantId: true,
      driverId: true,

      restaurantReview: {
        select: {
          id: true,
        },
      },

      driverReview: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    return {
      success: false,
      message: "Order not found.",
    };
  }

  if (order.status !== "DELIVERED") {
    return {
      success: false,
      message:
        "You can only review a delivered order.",
    };
  }

  if (order.restaurantReview) {
    return {
      success: false,
      message:
        "You have already reviewed this order.",
    };
  }

  const rawDriverRating =
    formData.get("driverRating");

  const result =
    orderReviewSchema.safeParse({
      restaurantRating:
        formData.get("restaurantRating"),

      driverRating:
        rawDriverRating
          ? rawDriverRating
          : undefined,

      restaurantComment:
        formData.get("restaurantComment"),

      driverComment:
        formData.get("driverComment"),
    });

  if (!result.success) {
    return {
      success: false,
      errors:
        result.error.flatten().fieldErrors,
    };
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.restaurantReview.create({
        data: {
          orderId: order.id,
          userId: user.id,
          restaurantId:
            order.restaurantId,

          rating:
            result.data.restaurantRating,

          comment:
            result.data.restaurantComment ||
            null,
        },
      });

      if (
        order.driverId &&
        result.data.driverRating
      ) {
        await tx.driverReview.create({
          data: {
            orderId: order.id,
            userId: user.id,
            driverId: order.driverId,

            rating:
              result.data.driverRating,

            comment:
              result.data.driverComment ||
              null,
          },
        });
      }
    }
  );

  revalidatePath(
    `/orders/${orderId}`
  );

  revalidatePath(
    "/orders"
  );

  redirect(
    `/orders/${orderId}`
  );
}