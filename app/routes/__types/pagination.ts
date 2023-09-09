import { parse } from '@conform-to/zod';
import { z } from 'zod';

const PageSchema = z.number().default(1);

const PaginationSchema = z.object({ page: PageSchema });

export type Pagination = z.infer<typeof PageSchema>;

export function parsePage(params: URLSearchParams) {
  const result = parse(params, { schema: PaginationSchema });
  return result.value?.page || 1;
}
