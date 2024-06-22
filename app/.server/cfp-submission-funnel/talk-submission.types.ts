import { z } from 'zod';

export const DraftSaveSchema = z.object({
  title: z.string().trim().min(1),
  abstract: z.string().trim().min(1),
  references: z.string().nullable().default(null),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable().default(null),
  languages: z.array(z.string()),
});

export type DraftSaveData = z.infer<typeof DraftSaveSchema>;

const TracksMandatorySchema = z.array(z.string()).nonempty();

const TracksSchema = z.array(z.string()).optional();

const TracksUpdateSchema = z.object({ formats: TracksSchema, categories: TracksSchema });

export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;

export function getTracksSchema(formatsRequired: boolean, categoriesRequired: boolean) {
  const FormatsSchema = formatsRequired ? TracksMandatorySchema : TracksSchema;
  const CategoriesSchema = categoriesRequired ? TracksMandatorySchema : TracksSchema;
  return z.object({ formats: FormatsSchema, categories: CategoriesSchema });
}
