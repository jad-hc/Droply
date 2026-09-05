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
  paymentMethod: "CASH";
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
    // ---------------------------------
    // 1. AUTHENTICATE CUSTOMER
    // ---------------------------------

    const user =
      await requireUser();

    // ---------------------------------
    // 2. READ CHECKOUT REQUEST
    // ---------------------------------

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

    if (
      body.paymentMethod !== "CASH"
    ) {
      return NextResponse.json(
        {
          message:
            "Unsupported payment method.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // 3. VERIFY CUSTOMER ADDRESS
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

    // NEW:
    // Customer address must have coordinates.

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
    // 4. BASIC CART VALIDATION
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

    // Remove duplicate menu-item IDs.

    const menuItemIds = [
      ...new Set(
        body.items.map(
          (item) =>
            item.menuItemId
        )
      ),
    ];

    // ---------------------------------
    // 5. LOAD REAL MENU DATA FROM DB
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

              // NEW
              latitude: true,
              longitude: true,

              // NEW
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
    // 6. MAKE SURE CART IS FROM
    //    ONE RESTAURANT
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
            "Your order must contain items from one restaurant.",
        },
        {
          status: 400,
        }
      );
    }

    const restaurant =
      menuItems[0].restaurant;

    // ---------------------------------
    // 7. VERIFY RESTAURANT
    // ---------------------------------

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

    // NEW:
    // Restaurant must also have coordinates.

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
    // 8. BUILD SECURE ORDER ITEMS
    // ---------------------------------

    let subtotalCents = 0;

    const orderItems = [];

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

      // Remove duplicate selected option IDs.

      const selectedOptionIds =
        new Set(
          cartItem.selectedOptionIds
        );

      // Build list of every valid option
      // belonging to this menu item.

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

      // Reject fake option IDs.

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

      const optionSnapshots = [];

      let optionPriceCents = 0;

      // Validate each option group.

      for (const group of menuItem.optionGroups) {
        const selectedOptions =
          group.options.filter(
            (option) =>
              selectedOptionIds.has(
                option.id
              )
          );

        const selectedCount =
          selectedOptions.length;

        if (
          selectedCount <
            group.minSelect ||
          selectedCount >
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
          const price =
            Number(
              option.priceAdjustment
            );

          optionPriceCents +=
            toCents(price);

          optionSnapshots.push({
            groupId:
              group.id,

            groupName:
              group.name,

            optionId:
              option.id,

            optionName:
              option.name,

            priceAdjustment:
              price,
          });
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

      const itemTotalCents =
        unitPriceCents *
        cartItem.quantity;

      subtotalCents +=
        itemTotalCents;

      orderItems.push({
        menuItemId:
          menuItem.id,

        name:
          menuItem.name,

        quantity:
          cartItem.quantity,

        basePrice:
          fromCents(
            basePriceCents
          ),

        unitPrice:
          fromCents(
            unitPriceCents
          ),

        total:
          fromCents(
            itemTotalCents
          ),

        selectedOptions:
          optionSnapshots,
      });
    }

    // ---------------------------------
    // 9. CHECK MINIMUM ORDER
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
    // 10. CALCULATE DELIVERY DISTANCE
    // ---------------------------------

    const distanceKm =
      calculateDistanceKm(
        restaurant.latitude,
        restaurant.longitude,
        address.latitude,
        address.longitude
      );

    // ---------------------------------
    // 11. CHECK DELIVERY RADIUS
    // ---------------------------------

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
    // 12. CALCULATE DELIVERY FEE
    // ---------------------------------

    const baseDeliveryFee =
      Number(
        restaurant.baseDeliveryFee
      );

    const feePerKm =
      Number(
        restaurant.deliveryFeePerKm
      );

    const deliveryFee =
      baseDeliveryFee +
      distanceKm * feePerKm;

    const deliveryFeeCents =
      toCents(deliveryFee);

    // ---------------------------------
    // 13. CALCULATE FINAL TOTAL
    // ---------------------------------

    const totalCents =
      subtotalCents +
      deliveryFeeCents;

    // ---------------------------------
    // 14. CREATE ORDER
    // ---------------------------------

    const order =
      await prisma.order.create({
        data: {
          userId:
            user.id,

          restaurantId:
            restaurant.id,

          status:
            "PENDING",

          paymentMethod:
            "CASH",

          paymentStatus:
            "PENDING",

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

          // Address snapshot
          deliveryAddress:
            address.addressLine,

          city:
            address.city,

          area:
            address.area,

          building:
            address.building,

          floor:
            address.floor,

          apartment:
            address.apartment,

          instructions:
            address.instructions,

          items: {
            create:
              orderItems,
          },
        },
      });

    // ---------------------------------
    // 15. SUCCESS RESPONSE
    // ---------------------------------

    return NextResponse.json({
      success: true,

      orderId:
        order.id,

      // Useful for debugging/testing.
      distanceKm:
        Number(
          distanceKm.toFixed(2)
        ),

      deliveryFee:
        fromCents(
          deliveryFeeCents
        ),

      subtotal:
        fromCents(
          subtotalCents
        ),

      total:
        fromCents(
          totalCents
        ),
    });
  } catch (error) {
    console.error(
      "PLACE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to place order.",
      },
      {
        status: 500,
      }
    );
  }
}