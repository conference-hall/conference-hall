import { z } from 'zod';
import { repeatable, text } from 'zod-form-data';

export const TalkSaveSchema = z.object({
  title: text(z.string().trim().min(1)),
  abstract: text(z.string().trim().min(1)),
  references: text(z.string().nullable().default(null)),
  level: text(z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null)),
  languages: repeatable(z.array(z.string())).optional(),
});

export type TalkSaveData = z.infer<typeof TalkSaveSchema>;
