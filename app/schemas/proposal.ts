import { z } from 'zod';
import { numeric, repeatable, text } from 'zod-form-data';

const ProposalLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

const ProposalStatusSchema = z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'DECLINED']);

const ProposalRatingsSchema = z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']);

export const ProposalCreateSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().trim().nullable(),
  languages: z.array(z.string().trim()),
  level: ProposalLevelSchema.nullable(),
});

export const ProposalUpdateSchema = z.object({
  title: text(z.string().trim().min(1)),
  abstract: text(z.string().trim().min(1)),
  references: text(z.string().trim().nullable().default(null)),
  level: text(ProposalLevelSchema.nullable().default(null)),
  languages: repeatable(z.array(z.string())).optional(),
  formats: repeatable(z.array(z.string())).optional(),
  categories: repeatable(z.array(z.string())).optional(),
});

export const ProposalSubmissionSchema = z.object({
  message: z.string().trim().max(1000).optional(),
});

export const ProposalsFiltersSchema = z.object({
  query: text(z.string().trim().optional()),
  sort: text(z.enum(['newest', 'oldest']).optional()),
  ratings: text(z.enum(['rated', 'not-rated']).optional()),
  status: text(ProposalStatusSchema.optional()),
  formats: text(z.string().optional()),
  categories: text(z.string().optional()),
});

export type ProposalRatingData = z.infer<typeof ProposalRatingDataSchema>;

export const ProposalRatingDataSchema = z.object({
  rating: numeric(z.number().min(0).max(5).nullable().default(null)),
  feeling: text(ProposalRatingsSchema),
});

export type ProposalCreateData = z.infer<typeof ProposalCreateSchema>;
export type ProposalUpdateData = z.infer<typeof ProposalUpdateSchema>;
export type ProposalSubmissionData = z.infer<typeof ProposalSubmissionSchema>;
export type ProposalsFilters = z.infer<typeof ProposalsFiltersSchema>;
