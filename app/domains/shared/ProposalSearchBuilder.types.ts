import { parse } from '@conform-to/zod';
import { z } from 'zod';

const EmailStatusSchema = z.enum(['not-sent', 'sent']).optional();

export type EmailStatusData = z.infer<typeof EmailStatusSchema>;

const ProposalStatusSchema = z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED']);

export const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).optional(),
  reviews: z.enum(['reviewed', 'not-reviewed']).optional(),
  status: z.array(ProposalStatusSchema).optional(),
  formats: z.string().optional(),
  categories: z.string().optional(),
  emailAcceptedStatus: EmailStatusSchema,
  emailRejectedStatus: EmailStatusSchema,
});

export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;

export function parseUrlFilters(url: string) {
  const params = new URL(url).searchParams;
  const result = parse(params, { schema: ProposalsFiltersSchema });
  return result.value || {};
}
