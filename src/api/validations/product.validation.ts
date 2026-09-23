import z from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters"),
    price: z.number().positive("Price must be a positive number"),
    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
