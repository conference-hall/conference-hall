import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';

const SearchFiltersSchema = z.object({
  query: z.string().trim().optional(),
  type: z.enum(['all', 'conference', 'meetup']).optional(),
  talkId: z.string().optional(),
});

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: SearchFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
