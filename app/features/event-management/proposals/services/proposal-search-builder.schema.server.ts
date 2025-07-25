import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';

const ReviewsFiltersSchema = z.enum(['reviewed', 'not-reviewed', 'my-favorites']).optional();

const StatusFilterSchema = z
  .enum(['pending', 'accepted', 'rejected', 'not-answered', 'confirmed', 'declined'])
  .optional();

const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest', 'most-comments', 'fewest-comments']).optional(),
  reviews: ReviewsFiltersSchema,
  status: StatusFilterSchema,
  formats: z.string().optional(),
  categories: z.string().optional(),
  tags: z.string().optional(),
  speakers: z.string().optional(),
});

export type ReviewsFilter = z.infer<typeof ReviewsFiltersSchema>;

export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parseWithZod(params, { schema: ProposalsFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
