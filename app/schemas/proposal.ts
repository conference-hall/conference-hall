import { ProposalStatus } from '@prisma/client';
import { z } from 'zod';
import { numeric, repeatable, text } from 'zod-form-data';
import { TalkSaveSchema } from './talks';

const ProposalStatusSchema = text(z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED']));

const ProposalRatingsSchema = text(z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']));

export const ProposalCreateSchema = TalkSaveSchema;

export function getProposalUpdateSchema(formatsRequired: boolean, categoriesRequired: boolean) {
  const FormatsSchema = formatsRequired
    ? repeatable(z.array(z.string()).nonempty())
    : repeatable(z.array(z.string())).optional();

  const CategoriesSchema = categoriesRequired
    ? repeatable(z.array(z.string()).nonempty())
    : repeatable(z.array(z.string())).optional();

  return TalkSaveSchema.extend({ formats: FormatsSchema, categories: CategoriesSchema });
}

export const ProposalUpdateSchema = TalkSaveSchema.extend({
  formats: repeatable(z.array(z.string())).optional(),
  categories: repeatable(z.array(z.string())).optional(),
});

export const ProposalSubmissionSchema = z.object({
  message: text(z.string().trim().max(1000).nullable().default(null)),
});

const EmailStatusSchema = text(z.enum(['not-sent', 'sent']).optional());

export const ProposalsFiltersSchema = z.object({
  query: text(z.string().trim().optional()),
  sort: text(z.enum(['newest', 'oldest']).optional()),
  ratings: text(z.enum(['rated', 'not-rated']).optional()),
  status: repeatable(z.array(ProposalStatusSchema)).optional(),
  formats: text(z.string().optional()),
  categories: text(z.string().optional()),
  emailAcceptedStatus: EmailStatusSchema,
  emailRejectedStatus: EmailStatusSchema,
});

export const ProposalRatingDataSchema = z.object({
  rating: numeric(z.number().min(0).max(5).nullable().default(null)),
  comment: text(z.string().trim().nullable().default(null)),
  feeling: ProposalRatingsSchema,
});

export const ProposalsStatusUpdateSchema = z.object({
  status: ProposalStatusSchema,
  selection: repeatable(z.array(z.string())),
});

export const ProposalsExportFiltersSchema = ProposalsFiltersSchema.extend({
  team: text(z.string()),
  event: text(z.string()),
});

export const ProposalSelectionSchema = z.object({
  selection: repeatable(z.array(z.string())),
});

export const ProposalParticipationSchema = z.object({
  participation: text(z.enum([ProposalStatus.CONFIRMED, ProposalStatus.DECLINED])),
});

export type ProposalStatusData = z.infer<typeof ProposalStatusSchema>;
export type ProposalCreateData = z.infer<typeof ProposalCreateSchema>;
export type ProposalUpdateData = z.infer<typeof ProposalUpdateSchema>;
export type ProposalSubmissionData = z.infer<typeof ProposalSubmissionSchema>;
export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;
export type ProposalRatingData = z.infer<typeof ProposalRatingDataSchema>;
export type EmailStatusData = z.infer<typeof EmailStatusSchema>;
export type ProposalParticipation = z.infer<typeof ProposalParticipationSchema>;
