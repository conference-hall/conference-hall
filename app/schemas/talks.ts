import { z } from 'zod';
import { repeatable } from 'zod-form-data';

export const TalkSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: repeatable(),
});

export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
