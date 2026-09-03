import {
  NextRequest,
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { calculateDistanceKm } from "@/lib/distance";

import {
  getRestaurantOpenStatus,
} from "@/lib/restaurant-hours";

type CheckoutItem = {
  menuItemId: string;
  quantity: number;
  selectedOptionIds: string[];
};

type CheckoutBody = {
  addressId: string;
  items: CheckoutItem[];
};

function toCents(value: number) {
  return Math.round(value * 100);
}

function fromCents(value: number) {
  return value / 100;
}

export async function POST(
  request: NextRequest
) {
  try {
    const user = await requireUser();

    const body =
      (await request.json()) as CheckoutBody;

    if (
      !body.addressId ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid checkout request.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // ADDRESS
    // ---------------------------------

    const address =
      await prisma.address.findFirst({
        where: {
          id: body.addressId,
          userId: user.id,
        },
      });

    if (!address) {
      return NextResponse.json(
        {
          message:
            "Delivery address not found.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      address.latitude == null ||
      address.longitude == null
    ) {
      return NextResponse.json(
        {
          message:
            "Please select a delivery location for your address.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // BASIC ITEM VALIDATION
    // ---------------------------------

    for (const cartItem of body.items) {
      if (
        !cartItem.menuItemId ||
        !Number.isInteger(
          cartItem.quantity
        ) ||
        cartItem.quantity < 1 ||
        cartItem.quantity > 50 ||
        !Array.isArray(
          cartItem.selectedOptionIds
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid cart item.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const menuItemIds = [
      ...new Set(
        body.items.map(
          (item) =>
            item.menuItemId
        )
      ),
    ];

    // ---------------------------------
    // LOAD MENU ITEMS
    // ---------------------------------

    const menuItems =
      await prisma.menuItem.findMany({
        where: {
          id: {
            in: menuItemIds,
          },

          isAvailable: true,
        },

        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            
              isActive: true,
              isApproved: true,
            
              latitude: true,
              longitude: true,
            
              deliveryRadiusKm: true,
              baseDeliveryFee: true,
              deliveryFeePerKm: true,
              minimumOrder: true,
            
              timezone: true,
            
             openingHours: {
                select: {
                  day: true,
                  isClosed: true,
                  openTime: true,
                  closeTime: true,
               },
              },
            },
          },

          optionGroups: {
            include: {
              options: true,
            },
          },
        },
      });

    if (
      menuItems.length !==
      menuItemIds.length
    ) {
      return NextResponse.json(
        {
          message:
            "One or more menu items are no longer available.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // ONE RESTAURANT
    // ---------------------------------

    const restaurantIds =
      new Set(
        menuItems.map(
          (item) =>
            item.restaurantId
        )
      );

    if (
      restaurantIds.size !== 1
    ) {
      return NextResponse.json(
        {
          message:
            "Your cart must contain items from one restaurant.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      menuItems[0].restaurant;

    if (
      !restaurant.isActive ||
      !restaurant.isApproved
    ) {
      return NextResponse.json(
        {
          message:
            "This restaurant is currently unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    const openStatus =
      getRestaurantOpenStatus({
        openingHours:
          restaurant.openingHours,

        timezone:
        restaurant.timezone,
      });

if (!openStatus.isOpen) {
  return NextResponse.json(
    {
      message:
        openStatus.reason ??
        "Restaurant is currently closed.",
    },
    {
      status: 400,
    }
  );
}

    if (
      restaurant.latitude == null ||
      restaurant.longitude == null
    ) {
      return NextResponse.json(
        {
          message:
            "Restaurant delivery location has not been configured.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // SECURE PRICE CALCULATION
    // ---------------------------------

    let subtotalCents = 0;

    for (const cartItem of body.items) {
      const menuItem =
        menuItems.find(
          (item) =>
            item.id ===
            cartItem.menuItemId
        );

      if (!menuItem) {
        return NextResponse.json(
          {
            message:
              "Menu item not found.",
          },
          {
            status: 400,
          }
        );
      }

      const selectedOptionIds =
        new Set(
          cartItem.selectedOptionIds
        );

      const validOptionIds =
        new Set(
          menuItem.optionGroups.flatMap(
            (group) =>
              group.options.map(
                (option) =>
                  option.id
              )
          )
        );

      for (const optionId of selectedOptionIds) {
        if (
          !validOptionIds.has(
            optionId
          )
        ) {
          return NextResponse.json(
            {
              message:
                `Invalid option selected for ${menuItem.name}.`,
            },
            {
              status: 400,
            }
          );
        }
      }

      let optionPriceCents = 0;

      for (const group of menuItem.optionGroups) {
        const selectedOptions =
          group.options.filter(
            (option) =>
              selectedOptionIds.has(
                option.id
              )
          );

        if (
          selectedOptions.length <
            group.minSelect ||
          selectedOptions.length >
            group.maxSelect
        ) {
          return NextResponse.json(
            {
              message:
                `${menuItem.name}: choose between ${group.minSelect} and ${group.maxSelect} options for ${group.name}.`,
            },
            {
              status: 400,
            }
          );
        }

        for (const option of selectedOptions) {
          optionPriceCents +=
            toCents(
              Number(
                option.priceAdjustment
              )
            );
        }
      }

      const basePriceCents =
        toCents(
          Number(
            menuItem.price
          )
        );

      const unitPriceCents =
        basePriceCents +
        optionPriceCents;

      subtotalCents +=
        unitPriceCents *
        cartItem.quantity;
    }

    // ---------------------------------
    // MINIMUM ORDER
    // ---------------------------------

    const minimumOrderCents =
      toCents(
        Number(
          restaurant.minimumOrder
        )
      );

    if (
      subtotalCents <
      minimumOrderCents
    ) {
      return NextResponse.json(
        {
          message:
            `Minimum order is $${Number(
              restaurant.minimumOrder
            ).toFixed(2)}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // DISTANCE
    // ---------------------------------

    const distanceKm =
      calculateDistanceKm(
        restaurant.latitude,
        restaurant.longitude,
        address.latitude,
        address.longitude
      );

    if (
      distanceKm >
      restaurant.deliveryRadiusKm
    ) {
      return NextResponse.json(
        {
          message:
            `This address is ${distanceKm.toFixed(
              1
            )} km away. The restaurant only delivers within ${restaurant.deliveryRadiusKm.toFixed(
              1
            )} km.`,
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // DELIVERY FEE
    // ---------------------------------

    const deliveryFee =
      Number(
        restaurant.baseDeliveryFee
      ) +
      distanceKm *
        Number(
          restaurant.deliveryFeePerKm
        );

    const deliveryFeeCents =
      toCents(deliveryFee);

    const totalCents =
      subtotalCents +
      deliveryFeeCents;

    // ---------------------------------
    // RETURN QUOTE
    // ---------------------------------

    return NextResponse.json({
      success: true,

      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },

      distanceKm:
        Number(
          distanceKm.toFixed(2)
        ),

      subtotal:
        fromCents(
          subtotalCents
        ),

      deliveryFee:
        fromCents(
          deliveryFeeCents
        ),

      total:
        fromCents(
          totalCents
        ),
    });
  } catch (error) {
    console.error(
      "CHECKOUT QUOTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to calculate delivery.",
      },
      {
        status: 500,
      }
    );
  }
}

/* opening hours for restaurant */

