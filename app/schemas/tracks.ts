import { z } from 'zod';
import { repeatable } from 'zod-form-data';

export const TracksUpdateSchema = z.object({
  formats: repeatable(z.array(z.string().trim())).optional(),
  categories: repeatable(z.array(z.string().trim())).optional(),
});

export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;
