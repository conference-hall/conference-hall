import { z } from 'zod';

import { repeatable, text } from './utils';

export const TalkSaveSchema = z.object({
  title: text(z.string().trim().min(1)),
  abstract: text(z.string().trim().min(1)),
  references: text(z.string().nullable().default(null)),
  level: text(z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null)),
  languages: repeatable(),
});

export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
