import { z } from "zod";

export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters.")
    .max(100),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long.")
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(100000),

  categoryId: z
    .string()
    .min(1, "Please select a category."),

  image: z
    .string()
    .url("Invalid image URL.")
    .optional()
    .or(z.literal("")),

  isAvailable: z.coerce.boolean().default(false),

  isFeatured: z.coerce.boolean().default(false),
});