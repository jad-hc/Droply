import {
  NextRequest,
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

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
    const user =
      await requireUser();

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

    // -----------------------
    // VERIFY ADDRESS
    // -----------------------

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

    // -----------------------
    // BASIC CART VALIDATION
    // -----------------------

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

    // Remove duplicate item IDs
    const menuItemIds = [
      ...new Set(
        body.items.map(
          (item) =>
            item.menuItemId
        )
      ),
    ];

    // -----------------------
    // LOAD REAL DATA
    // -----------------------

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

    // -----------------------
    // ONE RESTAURANT ONLY
    // -----------------------

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

    // -----------------------
    // BUILD SECURE ORDER
    // -----------------------

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

      // Remove duplicate option IDs
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

      // Reject option IDs that don't
      // belong to this menu item.
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

      // -----------------------
      // VALIDATE EACH GROUP
      // -----------------------

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
            groupId: group.id,
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

    // Temporary fixed delivery fee.
    // Later we'll calculate this from distance.
    const deliveryFeeCents = 250;

    const totalCents =
      subtotalCents +
      deliveryFeeCents;

    // -----------------------
    // CREATE ORDER
    // -----------------------

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

    return NextResponse.json({
      success: true,

      orderId:
        order.id,
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