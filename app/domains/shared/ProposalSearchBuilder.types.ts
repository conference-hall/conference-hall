import { parse } from '@conform-to/zod';
import { z } from 'zod';

export const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).optional(),
  reviews: z.enum(['reviewed', 'not-reviewed']).optional(),
  deliberation: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  publication: z.enum(['NOT_PUBLISHED', 'PUBLISHED']).optional(),
  confirmation: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']).optional(),
  formats: z.string().optional(),
  categories: z.string().optional(),
});

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parse(params, { schema: ProposalsFiltersSchema });
  return result.value || {};
}
