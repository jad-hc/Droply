import { z } from "zod";

export const menuItemOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Option name is required.")
    .max(60),

  priceAdjustment: z.coerce
    .number()
    .min(0, "Price adjustment cannot be negative.")
    .max(100000),
});