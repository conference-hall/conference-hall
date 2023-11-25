import { parse } from '@conform-to/zod';
import { z } from 'zod';

type PaginationOptions = { page: number; total: number; pageSize?: number };

const RESULTS_BY_PAGE = 25;

export class Pagination {
  constructor(private options: PaginationOptions) {}

  get pageCount() {
    return Math.ceil(this.options.total / this.pageSize);
  }

  get page() {
    const { page } = this.options;
    if (this.pageCount === 0) return 1;
    if (page < 1) return 1;
    if (page > this.pageCount) return this.pageCount;
    return page;
  }

  get pageIndex() {
    return this.page - 1;
  }

  get pageSize() {
    return this.options.pageSize || RESULTS_BY_PAGE;
  }
}

export function parseUrlPage(url: string) {
  const params = new URL(url).searchParams;
  const result = parse(params, { schema: z.object({ page: z.number().default(1) }) });
  return result.value?.page || 1;
}
