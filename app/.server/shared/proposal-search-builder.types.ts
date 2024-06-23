import { z } from 'zod';

import { parseWithZod } from '~/libs/zod-parser.ts';

const ReviewsFiltersSchema = z.enum(['reviewed', 'not-reviewed', 'my-favorites']).optional();

const StatusFilterSchema = z
  .enum(['pending', 'accepted', 'rejected', 'not-answered', 'confirmed', 'declined'])
  .optional();

export const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).optional(),
  reviews: ReviewsFiltersSchema,
  status: StatusFilterSchema,
  formats: z.string().optional(),
  categories: z.string().optional(),
});

export type ReviewsFilter = z.infer<typeof ReviewsFiltersSchema>;

export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, ProposalsFiltersSchema);
  return result.value || {};
}
