import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminDriverDetailsPage({
  params,
}: {
  params: Promise<{
    driverId: string;
  }>;
}) {
  const { driverId } = await params;

  const driver = await prisma.driverProfile.findUnique({
    where: {
      id: driverId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          roles: true,
        },
      },
    },
  });

  if (!driver) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/drivers"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to drivers
        </Link>

        <div className="mt-4">
          <h2 className="text-2xl font-bold">
            {driver.user.name}
          </h2>

          <p className="text-muted-foreground">
            Driver administration
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Approval
          </p>

          <p className="mt-2 font-semibold">
            {driver.approvalStatus}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Account
          </p>

          <p className="mt-2 font-semibold">
            {driver.isApproved
              ? "Approved"
              : "Not Approved"}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Driver Status
          </p>

          <p className="mt-2 font-semibold">
            {driver.status}
          </p>
        </div>
      </div>

      {/* User information */}
      <div className="rounded-lg border bg-background p-6">
        <h3 className="font-semibold">
          Personal Information
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Name
            </p>

            <p className="font-medium">
              {driver.user.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p className="font-medium">
              {driver.user.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Phone
            </p>

            <p className="font-medium">
              {driver.user.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              User roles
            </p>

            <p className="font-medium">
              {driver.user.roles.join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* Driver information */}
      <div className="rounded-lg border bg-background p-6">
        <h3 className="font-semibold">
          Driver Information
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Driver ID
            </p>

            <p className="font-medium">
              {driver.id}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Availability
            </p>

            <p className="font-medium">
              {driver.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Created
            </p>

            <p className="font-medium">
              {driver.createdAt.toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Last updated
            </p>

            <p className="font-medium">
              {driver.updatedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}