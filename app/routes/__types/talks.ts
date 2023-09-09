import { z } from 'zod';

export const TalkSaveSchema = z.object({
  title: z.string().trim(),
  abstract: z.string().trim(),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
});

export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
