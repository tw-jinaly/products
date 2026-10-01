import z from "zod";

export const basePaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: z.coerce.string().default("-createdAt"),
});

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const buildPaginationMetadata = (
  totalItems: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
