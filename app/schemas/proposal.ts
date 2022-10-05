import { z } from 'zod';
import { numeric, repeatable, text } from 'zod-form-data';
import { TalkSaveSchema } from './talks';

const ProposalStatusSchema = text(z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED']));

const ProposalRatingsSchema = text(z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']));

export const ProposalCreateSchema = TalkSaveSchema;

export const ProposalUpdateSchema = TalkSaveSchema.extend({
  formats: repeatable(z.array(z.string())).optional(),
  categories: repeatable(z.array(z.string())).optional(),
});

export const ProposalSubmissionSchema = z.object({
  message: text(z.string().trim().max(1000).optional()),
});

export const ProposalsFiltersSchema = z.object({
  query: text(z.string().trim().optional()),
  sort: text(z.enum(['newest', 'oldest']).optional()),
  ratings: text(z.enum(['rated', 'not-rated']).optional()),
  status: ProposalStatusSchema.optional(),
  formats: text(z.string().optional()),
  categories: text(z.string().optional()),
});

export const ProposalRatingDataSchema = z.object({
  rating: numeric(z.number().min(0).max(5).nullable().default(null)),
  feeling: ProposalRatingsSchema,
});

export type ProposalCreateData = z.infer<typeof ProposalCreateSchema>;
export type ProposalUpdateData = z.infer<typeof ProposalUpdateSchema>;
export type ProposalSubmissionData = z.infer<typeof ProposalSubmissionSchema>;
export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;
export type ProposalRatingData = z.infer<typeof ProposalRatingDataSchema>;
