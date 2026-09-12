import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  RestaurantApprovalStatus,
} from "@/app/generated/prisma/client";

export default async function AdminRestaurantDetailsPage({
  params,
}: {
  params: Promise<{
    restaurantId: string;
  }>;
}) {
  const { restaurantId } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: restaurantId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          orders: true,
          menuItems: true,
          reviews: true,
          members: true,
        },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/restaurants"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to restaurants
        </Link>

        <div className="mt-4">
          <h2 className="text-2xl font-bold">
            {restaurant.name}
          </h2>

          <p className="text-muted-foreground">
            Restaurant administration
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            Approval status
          </p>

          <p className="mt-2 text-lg font-semibold">
            {restaurant.approvalStatus}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            Restaurant status
          </p>

          <p className="mt-2 text-lg font-semibold">
            {restaurant.isActive
              ? "Active"
              : "Suspended"}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-6">
          <p className="text-sm text-muted-foreground">
            Orders
          </p>

          <p className="mt-2 text-lg font-semibold">
            {restaurant._count.orders}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <h3 className="font-semibold">
          Restaurant Information
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Name
            </p>
            <p className="font-medium">
              {restaurant.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Slug
            </p>
            <p className="font-medium">
              {restaurant.slug}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Phone
            </p>
            <p className="font-medium">
              {restaurant.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>
            <p className="font-medium">
              {restaurant.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Address
            </p>
            <p className="font-medium">
              {restaurant.address || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Area
            </p>
            <p className="font-medium">
              {restaurant.area || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <h3 className="font-semibold">
          Owner
        </h3>

        <div className="mt-4 space-y-2">
          <p>
            <span className="text-muted-foreground">
              Name:
            </span>{" "}
            {restaurant.owner.name}
          </p>

          <p>
            <span className="text-muted-foreground">
              Email:
            </span>{" "}
            {restaurant.owner.email}
          </p>

          <p>
            <span className="text-muted-foreground">
              Phone:
            </span>{" "}
            {restaurant.owner.phone || "Not provided"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-6">
        <h3 className="font-semibold">
          Statistics
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Menu Items
            </p>
            <p className="text-2xl font-bold">
              {restaurant._count.menuItems}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Orders
            </p>
            <p className="text-2xl font-bold">
              {restaurant._count.orders}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Reviews
            </p>
            <p className="text-2xl font-bold">
              {restaurant._count.reviews}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
