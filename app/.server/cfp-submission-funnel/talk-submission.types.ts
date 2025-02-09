import { z } from 'zod';

export const DraftSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
});

export const TracksMandatorySchema = z.array(z.string()).nonempty();

export const TracksOptionalSchema = z.array(z.string()).optional();

const TracksUpdateSchema = z.object({ formats: TracksOptionalSchema, categories: TracksOptionalSchema });

export type DraftSaveData = z.infer<typeof DraftSaveSchema>;
export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;
