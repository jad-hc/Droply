import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function requireRestaurantAccess(
  restaurantId: string
) {
  const user = await requireUser();

  const membership =
    await prisma.restaurantMember.findUnique({
      where: {
        userId_restaurantId: {
          userId: user.id,
          restaurantId,
        },
      },

      include: {
        restaurant: true,
      },
    });

  if (!membership) {
    throw new Error(
      "You do not have access to this restaurant."
    );
  }

  return {
    user,
    membership,
    restaurant: membership.restaurant,
  };
}