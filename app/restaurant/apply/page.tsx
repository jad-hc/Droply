import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { RestaurantForm } from "./restaurant-form";

export default async function RestaurantApplyPage() {
  const user = await requireUser();

  const existingRestaurant =
    await prisma.restaurant.findFirst({
      where: {
        ownerId: user.id,
      },
    });

  if (existingRestaurant) {
    redirect("/restaurant");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Register your restaurant
        </h1>

        <p className="mt-2 text-muted-foreground">
          Add your restaurant to the food delivery platform.
        </p>
      </div>

      <div className="rounded-xl border p-6 shadow-sm">
        <RestaurantForm />
      </div>
    </main>
  );
}