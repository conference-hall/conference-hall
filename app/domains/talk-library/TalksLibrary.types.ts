import { z } from 'zod';

export const TalkSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
});

export type TalkSchema = z.infer<typeof TalkSaveSchema>;
