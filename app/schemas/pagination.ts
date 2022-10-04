import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { numeric } from 'zod-form-data';

const PageSchema = numeric(z.number().positive().default(1));

const PaginationSchema = z.object({ page: PageSchema });

export type Pagination = z.infer<typeof PageSchema>;

export async function parsePage(params: URLSearchParams) {
  const result = await withZod(PaginationSchema).validate(params);
  return result.error ? 1 : result.data.page;
}
