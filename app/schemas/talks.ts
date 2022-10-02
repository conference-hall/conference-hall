import { z } from 'zod';

export const TalkSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  languages: z.array(z.string()),
});

export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
