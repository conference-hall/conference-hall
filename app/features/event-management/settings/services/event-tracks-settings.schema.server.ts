import { z } from 'zod';

export const TrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255),
});

export type TrackSaveData = z.infer<typeof TrackSaveSchema>;

export const TracksSettingsSchema = z.object({
  formatsRequired: z.stringbool(),
  formatsAllowMultiple: z.stringbool(),
  categoriesRequired: z.stringbool(),
  categoriesAllowMultiple: z.stringbool(),
});
