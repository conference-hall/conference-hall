import { z } from 'zod';

export const ProposalSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
  formats: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export type ProposalSaveData = z.infer<typeof ProposalSaveSchema>;
