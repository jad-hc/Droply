import { z } from "zod";

export const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .max(40)
    .optional(),

  addressLine: z
    .string()
    .trim()
    .min(3, "Address is required.")
    .max(200),

  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(100),

  area: z
    .string()
    .trim()
    .max(100)
    .optional(),

  building: z
    .string()
    .trim()
    .max(100)
    .optional(),

  floor: z
    .string()
    .trim()
    .max(30)
    .optional(),

  apartment: z
    .string()
    .trim()
    .max(30)
    .optional(),

  instructions: z
    .string()
    .trim()
    .max(300)
    .optional(),

  latitude: z.coerce
  .number()
  .min(-90)
  .max(90),

  longitude: z.coerce
    .number()
    .min(-180)
    .max(180),
});