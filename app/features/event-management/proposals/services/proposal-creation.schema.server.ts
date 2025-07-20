import { z } from 'zod';

// todo(proposal): reuse existing schemas ?
export const TalkProposalCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  abstract: z.string().min(1, 'Abstract is required').max(5000),
  references: z.string().optional(),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  formats: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export type TalkProposalCreationData = z.infer<typeof TalkProposalCreationSchema>;
