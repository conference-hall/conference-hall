import { z } from 'zod';

import { numeric } from './utils';

const PageSchema = numeric().default(1);

const PaginationSchema = z.object({ page: PageSchema });

export type Pagination = z.infer<typeof PageSchema>;

export function parsePage(params: URLSearchParams) {
  const result = PaginationSchema.safeParse(Object.fromEntries(params));
  return result.success ? result.data.page : 1;
}
