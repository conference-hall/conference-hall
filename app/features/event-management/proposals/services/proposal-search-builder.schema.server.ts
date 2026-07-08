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

// Invalid or empty values fall back to undefined so a bad URL param only drops that filter.
// The catch must sit inside .optional(): conform's coercion unwraps ZodOptional but not ZodCatch.
const dropInvalid = <T extends z.ZodType>(schema: T) => schema.catch(undefined as never).optional();

const ReviewsFiltersSchema = dropInvalid(z.array(ReviewValueSchema));

const StatusFilterSchema = dropInvalid(z.enum(['pending', 'accepted', 'rejected', 'archived']));

const ConfirmationFilterSchema = dropInvalid(z.enum(['not-answered', 'confirmed', 'declined']));

const MessagesFilterSchema = dropInvalid(z.enum(['new']));

const ProposalsFiltersSchema = z.object({
  query: dropInvalid(z.string().trim()),
  sort: dropInvalid(z.enum(['date', 'reviews', 'favorites', 'my-review', 'comments'])),
  order: dropInvalid(z.enum(['asc', 'desc'])),
  reviews: ReviewsFiltersSchema,
  status: StatusFilterSchema,
  confirmation: ConfirmationFilterSchema,
  messages: MessagesFilterSchema,
  formats: dropInvalid(z.string()),
  categories: dropInvalid(z.string()),
  tags: dropInvalid(z.string()),
  speakers: dropInvalid(z.string()),
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
