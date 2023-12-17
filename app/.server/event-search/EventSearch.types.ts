import { parse } from '@conform-to/zod';
import { z } from 'zod';

export const SearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  type: z.enum(['all', 'conference', 'meetup']).optional(),
  talkId: z.string().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parse(params, { schema: SearchFiltersSchema });
  return result.value || {};
}
