import { z } from 'zod';
import { repeatable } from 'zod-form-data';

export const TracksMandatorySchema = repeatable(z.array(z.string().trim()).nonempty());

export const TracksSchema = repeatable(z.array(z.string().trim())).optional();

export const TracksUpdateSchema = z.object({
  formats: TracksSchema.optional(),
  categories: TracksSchema.optional(),
});

export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;
