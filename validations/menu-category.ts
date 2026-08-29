import { z } from "zod";

export const menuCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(60, "Category name is too long."),

  description: z
    .string()
    .trim()
    .max(300, "Description is too long.")
    .optional(),

  sortOrder: z.coerce
    .number()
    .int()
    .min(0)
    .default(0),
});