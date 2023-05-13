import { z } from 'zod';
import { text } from '~/schemas/utils';

export const SearchFiltersSchema = z.object({
  query: text().optional(),
  type: text(z.enum(['all', 'conference', 'meetup'])).optional(),
  talkId: text().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export async function parseFilters(params: URLSearchParams) {
  const result = await SearchFiltersSchema.safeParse(Object.fromEntries(params));
  return result.success ? result.data : {};
}
