import { z } from 'zod';

const TracksMandatorySchema = z.array(z.string()).nonempty();

const TracksSchema = z.array(z.string()).optional();

const TracksUpdateSchema = z.object({ formats: TracksSchema, categories: TracksSchema });

export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;

export function getTracksSchema(formatsRequired: boolean, categoriesRequired: boolean) {
  const FormatsSchema = formatsRequired ? TracksMandatorySchema : TracksSchema;
  const CategoriesSchema = categoriesRequired ? TracksMandatorySchema : TracksSchema;
  return z.object({ formats: FormatsSchema, categories: CategoriesSchema });
}
