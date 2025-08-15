import { z } from 'zod';

// todo(proposal): reuse existing schemas ?
// todo(proposal): manage mandatory or optional tracks
export const TalkProposalCreationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  abstract: z.string().min(1, 'Abstract is required').max(5000),
  speakers: z.array(z.string()).min(1, 'At least one speaker is required'),
  references: z.string().optional(),
  languages: z.array(z.string()).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  formats: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type TalkProposalCreationData = z.infer<typeof TalkProposalCreationSchema>;

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

export const ProposalSaveTagsSchema = z.object({
  tags: z.array(z.string()),
});

export type ProposalSaveTagsData = z.infer<typeof ProposalSaveTagsSchema>;
