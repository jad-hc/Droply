import { z } from "zod";

export const restaurantSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(100),

  description: z
    .string()
    .max(1000, "Description is too long.")
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
    .min(3, "Please enter an address."),

  city: z
    .string()
    .min(2, "Please enter a city."),

  area: z
    .string()
    .optional(),

  logo: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  coverImage: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  latitude: z.coerce
    .number()
    .min(-90)
    .max(90),

  longitude: z.coerce
    .number()
    .min(-180)
    .max(180),

  deliveryRadiusKm: z.coerce
  .number()
  .positive()
  .max(100),

  baseDeliveryFee: z.coerce
  .number()
  .min(0)
  .max(1000),

  deliveryFeePerKm: z.coerce
  .number()
  .min(0)
  .max(1000),

  minimumOrder: z.coerce
  .number()
  .min(0)
  .max(100000),
});

export type RestaurantSettingsInput = z.infer<
  typeof restaurantSettingsSchema
>;
