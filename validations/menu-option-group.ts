import { z } from "zod";

export const optionGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Group name must be at least 2 characters.")
    .max(60),

  required: z.coerce.boolean(),

  minSelect: z.coerce
    .number()
    .int()
    .min(0),

  maxSelect: z.coerce
    .number()
    .int()
    .min(1),
}).refine(
  (data) => data.maxSelect >= data.minSelect,
  {
    message:
      "Maximum selections cannot be smaller than minimum selections.",
    path: ["maxSelect"],
  }
);