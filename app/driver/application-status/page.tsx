import Link from "next/link";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export default async function DriverApplicationStatusPage() {
  const user = await requireUser();

  const profile =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <p>
          You haven't submitted a driver application.
        </p>

        <Link
          href="/driver/apply"
          className="mt-4 inline-block"
        >
          Apply now
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-xl border p-8 text-center">
        <h1 className="text-2xl font-bold">
          Driver Application
        </h1>

        <p className="mt-4">
          Status:
        </p>

        <p className="mt-2 text-lg font-semibold">
          {profile.isApproved
            ? "Approved"
            : "Pending Approval"}
        </p>

        {profile.isApproved && (
          <Link
            href="/driver"
            className="mt-6 inline-block rounded-md bg-foreground px-5 py-2 text-background"
          >
            Driver Dashboard
          </Link>
        )}
      </div>
    </main>
  );
}