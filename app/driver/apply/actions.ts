"use server";

import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { driverApplicationSchema } from "@/validations/driver";

export type DriverApplicationState = {
  success: boolean;
  message?: string;

  errors?: {
    vehicleType?: string[];
    vehicleModel?: string[];
    vehiclePlate?: string[];
    licenseNumber?: string[];
  };
};

export async function applyAsDriver(
  previousState: DriverApplicationState,
  formData: FormData
): Promise<DriverApplicationState> {
  const user = await requireUser();

  const existingProfile =
    await prisma.driverProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (existingProfile) {
    redirect("/driver/application-status");
  }

  const result =
    driverApplicationSchema.safeParse({
      vehicleType: formData.get("vehicleType"),
      vehicleModel: formData.get("vehicleModel"),
      vehiclePlate: formData.get("vehiclePlate"),
      licenseNumber: formData.get("licenseNumber"),
    });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await prisma.driverProfile.create({
    data: {
      userId: user.id,

      vehicleType: result.data.vehicleType,
      vehicleModel: result.data.vehicleModel,
      vehiclePlate: result.data.vehiclePlate,
      licenseNumber: result.data.licenseNumber,

      isApproved: false,
      status: "OFFLINE",
    },
  });

  redirect("/driver/application-status");
}