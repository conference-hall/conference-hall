import { z } from 'zod';

export const ReviewValueSchema = z.enum([
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

export const StatusFilterSchema = z.enum(['pending', 'accepted', 'rejected', 'archived']);

export const ConfirmationFilterSchema = z.enum(['not-answered', 'confirmed', 'declined']);

export const MessagesFilterSchema = z.enum(['new']);

export const SortFilterSchema = z.enum(['date', 'reviews', 'favorites', 'my-review', 'comments']);

export const OrderFilterSchema = z.enum(['asc', 'desc']);

export const ReviewsFiltersSchema = z.array(ReviewValueSchema).optional();

export const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: SortFilterSchema.optional(),
  order: OrderFilterSchema.optional(),
  reviews: ReviewsFiltersSchema,
  status: StatusFilterSchema.optional(),
  confirmation: ConfirmationFilterSchema.optional(),
  messages: MessagesFilterSchema.optional(),
  formats: z.string().optional(),
  categories: z.string().optional(),
  tags: z.string().optional(),
  speakers: z.string().optional(),
});

export type ReviewsFilter = z.infer<typeof ReviewsFiltersSchema>;

export type StatusFilter = z.infer<typeof StatusFilterSchema>;

export type ConfirmationFilter = z.infer<typeof ConfirmationFilterSchema>;

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;
