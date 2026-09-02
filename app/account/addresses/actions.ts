"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { addressSchema } from "@/validations/address";

export type AddressState = {
  success: boolean;
  message?: string;

  errors?: {
    label?: string[];
    addressLine?: string[];
    city?: string[];
    area?: string[];
    building?: string[];
    floor?: string[];
    apartment?: string[];
    instructions?: string[];
    latitude?: string[];
    longitude?: string[];
  };
};

export async function createAddress(
  previousState: AddressState,
  formData: FormData
): Promise<AddressState> {
  const user = await requireUser();

  const result = addressSchema.safeParse({
    label: formData.get("label"),
    addressLine: formData.get("addressLine"),
    city: formData.get("city"),
    area: formData.get("area"),
    building: formData.get("building"),
    floor: formData.get("floor"),
    apartment: formData.get("apartment"),
    instructions: formData.get("instructions"),
    latitude:formData.get("latitude"),
    longitude:formData.get("longitude"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const existingAddressCount = await prisma.address.count({
    where: {
      userId: user.id,
    },
  });

  await prisma.address.create({
    data: {
      userId: user.id,

      label: result.data.label || null,
      addressLine: result.data.addressLine,
      city: result.data.city,
      area: result.data.area || null,
      building: result.data.building || null,
      floor: result.data.floor || null,
      apartment: result.data.apartment || null,
      instructions: result.data.instructions || null,
      latitude:result.data.latitude,
      longitude:result.data.longitude,

      // First address automatically becomes default.
      isDefault: existingAddressCount === 0,
    },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");

  return {
    success: true,
    message: "Address added.",
  };
}

export async function deleteAddress(addressId: string) {
  const user = await requireUser();

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
  });

  if (!address) {
    throw new Error("Address not found.");
  }

  await prisma.address.delete({
    where: {
      id: addressId,
    },
  });

  // If the deleted address was default,
  // make another one default.
  if (address.isDefault) {
    const nextAddress = await prisma.address.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (nextAddress) {
      await prisma.address.update({
        where: {
          id: nextAddress.id,
        },
        data: {
          isDefault: true,
        },
      });
    }
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}


export async function setDefaultAddress(addressId: string) {
  const user = await requireUser();

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
  });

  if (!address) {
    throw new Error("Address not found.");
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: {
        userId: user.id,
      },
      data: {
        isDefault: false,
      },
    }),

    prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    }),
  ]);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}