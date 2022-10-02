import { z } from 'zod';

export const SearchFiltersSchema = z.preprocess(
  (filters: any) => ({
    ...filters,
    query: filters.query?.trim(),
    type: ['all', 'conference', 'meetup'].includes(filters.type) ? filters.type : undefined,
    cfp: ['incoming', 'past'].includes(filters.cfp) ? filters.cfp : undefined,
  }),
  z.object({
    query: z.string().trim().optional(),
    type: z.enum(['all', 'conference', 'meetup']).optional(),
    cfp: z.enum(['incoming', 'past']).optional(),
    talkId: z.string().trim().nullable().optional(),
  })
);

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
