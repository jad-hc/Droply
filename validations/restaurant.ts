import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100),

  description: z
    .string()
    .max(1000)
    .optional(),

  phone: z
    .string()
    .min(6, "Please enter a valid phone number.")
    .max(30),

  email: z
    .string()
    .email("Please enter a valid email.")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .min(3, "Please enter the restaurant address."),

  city: z
    .string()
    .min(2, "Please enter the city."),

  area: z
    .string()
    .optional(),
});

export type CreateRestaurantInput = z.infer<
  typeof createRestaurantSchema
>;