import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { DriverApplicationForm } from "./driver-application-form";

export default async function DriverApplyPage() {
  const user = await requireUser();

  const profile =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (profile) {
    redirect("/driver/application-status");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Become a Driver
      </h1>

      <p className="mt-2 text-muted-foreground">
        Submit your information for approval.
      </p>

      <div className="mt-8">
        <DriverApplicationForm />
      </div>
    </main>
  );
}