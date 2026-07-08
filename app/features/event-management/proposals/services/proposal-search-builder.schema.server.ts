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

const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['date', 'reviews', 'favorites', 'my-review', 'comments']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  reviews: ReviewsFiltersSchema,
  status: StatusFilterSchema,
  confirmation: ConfirmationFilterSchema,
  messages: MessagesFilterSchema,
  formats: z.string().optional(),
  categories: z.string().optional(),
  tags: z.string().optional(),
  speakers: z.string().optional(),
});

export type ReviewsFilter = z.infer<typeof ReviewsFiltersSchema>;

export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export type ConfirmationFilter = z.infer<typeof ConfirmationFilterSchema>;

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;

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
