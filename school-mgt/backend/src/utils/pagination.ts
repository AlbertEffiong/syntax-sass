import { z } from 'zod';

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Normalises page/limit into a Mongo `skip`.
 */
export function resolvePagination(page = 1, limit = 20): Pagination {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

/**
 * Wraps a page of items with metadata for consistent list responses.
 */
export function paginate<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  return {
    items,
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
  };
}
