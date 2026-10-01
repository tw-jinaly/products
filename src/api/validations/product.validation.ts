import { z } from "zod";
import { basePaginationSchema } from "../../common/pagination.schema.js";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters"),
  price: z.number().positive("Price must be greater than zero"),
  stock: z
    .number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = basePaginationSchema.extend({
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().trim().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>;
