import { z } from "zod";

export const driverApplicationSchema = z.object({
  vehicleType: z
    .string()
    .trim()
    .min(2, "Vehicle type is required.")
    .max(50),

  vehicleModel: z
    .string()
    .trim()
    .min(2, "Vehicle model is required.")
    .max(100),

  vehiclePlate: z
    .string()
    .trim()
    .min(2, "Vehicle plate is required.")
    .max(30),

  licenseNumber: z
    .string()
    .trim()
    .min(2, "License number is required.")
    .max(60),
});