import { z } from 'zod';

import { repeatable } from './utils';

export const TalkSaveSchema = z.object({
  title: z.string().trim(),
  abstract: z.string().trim(),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: repeatable(),
});

export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
