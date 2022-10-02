import { z } from 'zod';

export const TracksUpdateSchema = z.object({
  formats: z.array(z.string().trim()),
  categories: z.array(z.string().trim()),
});

export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;
