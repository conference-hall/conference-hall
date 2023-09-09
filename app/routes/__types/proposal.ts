import { ProposalStatus } from '@prisma/client';
import { z } from 'zod';

import { TalkSaveSchema } from './talks';
import { numeric, repeatable } from './utils';

const ProposalStatusSchema = z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED']);

const ReviewFeelingsSchema = z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']);

export const ProposalCreateSchema = TalkSaveSchema;

export function getProposalUpdateSchema(formatsRequired: boolean, categoriesRequired: boolean) {
  const FormatsSchema = formatsRequired ? repeatable(z.array(z.string()).nonempty()) : repeatable().optional();
  const CategoriesSchema = categoriesRequired ? repeatable(z.array(z.string()).nonempty()) : repeatable().optional();

  return TalkSaveSchema.extend({ formats: FormatsSchema, categories: CategoriesSchema });
}

export const ProposalUpdateSchema = TalkSaveSchema.extend({
  formats: repeatable(z.array(z.string())).optional(),
  categories: repeatable(z.array(z.string())).optional(),
});

export const ProposalSubmissionSchema = z.object({
  message: z.string().trim().max(1000).nullable().default(null),
});

const EmailStatusSchema = z.enum(['not-sent', 'sent']).optional();

const ProposalsFiltersSchema = z.object({
  query: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).optional(),
  reviews: z.enum(['reviewed', 'not-reviewed']).optional(),
  status: repeatable(z.array(ProposalStatusSchema)).optional(),
  formats: z.string().optional(),
  categories: z.string().optional(),
  emailAcceptedStatus: EmailStatusSchema,
  emailRejectedStatus: EmailStatusSchema,
});

export function parseProposalsFilters(params: URLSearchParams) {
  const result = ProposalsFiltersSchema.safeParse(Object.fromEntries(params));
  return result.success ? result.data : {};
}

export const ProposalReviewDataSchema = z.object({
  note: numeric(z.number().min(0).max(5).nullable().default(null)),
  comment: z.string().trim().nullable().default(null),
  feeling: ReviewFeelingsSchema,
});

export const ProposalsStatusUpdateSchema = z.object({
  status: ProposalStatusSchema,
  selection: repeatable(z.array(z.string())),
});

export const ProposalSelectionSchema = z.object({
  selection: repeatable(z.array(z.string())),
});

export const ProposalParticipationSchema = z.object({
  participation: z.enum([ProposalStatus.CONFIRMED, ProposalStatus.DECLINED]),
});

export type ProposalStatusData = z.infer<typeof ProposalStatusSchema>;
export type ProposalCreateData = z.infer<typeof ProposalCreateSchema>;
export type ProposalUpdateData = z.infer<typeof ProposalUpdateSchema>;
export type ProposalSubmissionData = z.infer<typeof ProposalSubmissionSchema>;
export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;
export type ProposalReviewData = z.infer<typeof ProposalReviewDataSchema>;
export type EmailStatusData = z.infer<typeof EmailStatusSchema>;
export type ProposalParticipation = z.infer<typeof ProposalParticipationSchema>;
