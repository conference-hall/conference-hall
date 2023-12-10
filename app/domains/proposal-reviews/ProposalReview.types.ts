import { z } from 'zod';

export const ProposalUpdateSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
  formats: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export type ProposalUpdateData = z.infer<typeof ProposalUpdateSchema>;

export const ReviewUpdateDataSchema = z.object({
  note: z.number().min(0).max(5).nullable().default(null),
  comment: z.string().trim().nullable().default(null),
  feeling: z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'NO_OPINION']),
});

export type ReviewUpdateData = z.infer<typeof ReviewUpdateDataSchema>;
