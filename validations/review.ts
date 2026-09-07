import { z } from "zod";

export const orderReviewSchema = z.object({
  restaurantRating: z.coerce
    .number()
    .int()
    .min(1)
    .max(5),

  driverRating: z.coerce
    .number()
    .int()
    .min(1)
    .max(5)
    .optional(),

  restaurantComment: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  driverComment: z
    .string()
    .trim()
    .max(1000)
    .optional(),
});