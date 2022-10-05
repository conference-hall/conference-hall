import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { text } from 'zod-form-data';

export const SearchFiltersSchema = z.object({
  query: text(z.string().trim().optional()),
  type: text(z.enum(['all', 'conference', 'meetup']).optional()),
  cfp: text(z.enum(['incoming', 'past']).optional()),
  talkId: text(z.string().trim().optional()),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export async function parseFilters(params: URLSearchParams) {
  const result = await withZod(SearchFiltersSchema).validate(params);
  return result.error ? {} : result.data;
}
