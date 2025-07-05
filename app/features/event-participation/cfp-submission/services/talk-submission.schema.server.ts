import { z } from 'zod';

export const TracksMandatorySchema = z.array(z.string()).nonempty();

export const TracksOptionalSchema = z.array(z.string()).optional();

const TracksUpdateSchema = z.object({ formats: TracksOptionalSchema, categories: TracksOptionalSchema });

export type TrackUpdateData = z.infer<typeof TracksUpdateSchema>;
