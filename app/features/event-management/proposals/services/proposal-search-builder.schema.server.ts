import { parseWithZod } from '@conform-to/zod/v4';
import { z } from 'zod';

const ReviewValueSchema = z.enum([
  'not-reviewed',
  'no-opinion',
  'negative',
  'neutral-1',
  'neutral-2',
  'neutral-3',
  'neutral-4',
  'neutral-5',
  'positive',
]);

const ReviewsFiltersSchema = z.array(ReviewValueSchema).optional();

const StatusFilterSchema = z.enum(['pending', 'accepted', 'rejected', 'archived']).optional();

const ConfirmationFilterSchema = z.enum(['not-answered', 'confirmed', 'declined']).optional();

const MessagesFilterSchema = z.enum(['new']).optional();

// Each field falls back to undefined on invalid input so a bad URL param only drops that filter
const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional().catch(undefined),
  sort: z.enum(['date', 'reviews', 'favorites', 'my-review', 'comments']).optional().catch(undefined),
  order: z.enum(['asc', 'desc']).optional().catch(undefined),
  reviews: ReviewsFiltersSchema.catch(undefined),
  status: StatusFilterSchema.catch(undefined),
  confirmation: ConfirmationFilterSchema.catch(undefined),
  messages: MessagesFilterSchema.catch(undefined),
  formats: z.string().optional().catch(undefined),
  categories: z.string().optional().catch(undefined),
  tags: z.string().optional().catch(undefined),
  speakers: z.string().optional().catch(undefined),
});

export type ReviewsFilter = z.infer<typeof ReviewsFiltersSchema>;

export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export type ConfirmationFilter = z.infer<typeof ConfirmationFilterSchema>;

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;

export function parseUrlFilters(url: URL) {
  const params = url.searchParams;
  const result = parseWithZod(params, { schema: ProposalsFiltersSchema });
  if (result.status !== 'success') return {};
  return result.value;
}
