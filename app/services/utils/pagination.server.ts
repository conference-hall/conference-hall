import { z } from 'zod';

export function getPagination(page: number, resultsCount: number, resultsByPage: number) {
  const totalPages = Math.ceil(resultsCount / resultsByPage);
  const pageIndex = computePageIndex(page, totalPages);
  const currentPage = pageIndex + 1;
  return { currentPage, totalPages, pageIndex };
}

function computePageIndex(current: number, total: number) {
  if (total === 0) return 0;
  if (current <= 0) return 0;
  if (current > total) return total - 1;
  return current - 1;
}

export type Pagination = z.infer<typeof PaginationSchema>;

const PaginationSchema = z.preprocess((a) => parseInt(a as string, 10), z.number().positive().optional());

export function validatePage(params: URLSearchParams) {
  const result = PaginationSchema.safeParse(params.get('page'));
  return result.success ? result.data : 1;
}
