import { parseWithZod } from '@conform-to/zod/v4';
import { ProposalsFiltersSchema } from './proposal-search-builder.schema.ts';

export * from './proposal-search-builder.schema.ts';

// Invalid params only drop the offending filters: on error, remove them and parse again
export function parseUrlFilters(url: URL) {
  const params = new URLSearchParams(url.searchParams);
  let result = parseWithZod(params, { schema: ProposalsFiltersSchema });
  if (result.status === 'error') {
    for (const field of Object.keys(result.error ?? {})) {
      params.delete(field.split('[')[0]);
    }
    result = parseWithZod(params, { schema: ProposalsFiltersSchema });
  }
  if (result.status !== 'success') return {};
  return result.value;
}
