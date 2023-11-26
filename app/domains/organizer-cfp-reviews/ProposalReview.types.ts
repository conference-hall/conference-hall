import { z } from 'zod';

export const ProposalReviewDataSchema = z.object({
  note: z.number().min(0).max(5).nullable().default(null),
  comment: z.string().trim().nullable().default(null),
  feeling: z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']),
});

export type ProposalReviewData = z.infer<typeof ProposalReviewDataSchema>;
