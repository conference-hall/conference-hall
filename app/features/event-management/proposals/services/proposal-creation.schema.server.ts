import { z } from 'zod';

// todo(proposal): reuse existing schemas ?
export const TalkProposalCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  abstract: z.string().min(1, 'Abstract is required').max(5000),
  speakers: z.array(z.string()).min(1, 'At least one speaker is required'),
  references: z.string().optional(),
  languages: z.array(z.string()).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  formats: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export type TalkProposalCreationData = z.infer<typeof TalkProposalCreationSchema>;
