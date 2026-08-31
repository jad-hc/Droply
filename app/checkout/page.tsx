import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const user = await requireUser();

  const addresses = await prisma.address.findMany({
    where: {
      userId: user.id,
    },

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Checkout
        </h1>

        <p className="mt-2 text-muted-foreground">
          Confirm your delivery details and place your order.
        </p>
      </div>

      <CheckoutClient
        addresses={addresses.map((address) => ({
          id: address.id,
          label: address.label,
          addressLine: address.addressLine,
          city: address.city,
          area: address.area,
          building: address.building,
          floor: address.floor,
          apartment: address.apartment,
          isDefault: address.isDefault,
        }))}
      />
    </main>
  );
}