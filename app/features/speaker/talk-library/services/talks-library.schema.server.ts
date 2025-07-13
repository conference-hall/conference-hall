import { z } from 'zod/v4';

export const TalksListFilterSchema = z.enum(['all', 'archived', 'active']).optional();

export const TalkSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
});

export type TalksListFilter = z.infer<typeof TalksListFilterSchema>;
export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
