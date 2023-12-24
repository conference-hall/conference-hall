import { z } from 'zod';

export const TrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255),
});

export type TrackSaveData = z.infer<typeof TrackSaveSchema>;

export const TracksSettingsSchema = z.object({
  formatsRequired: z
    .string()
    .transform((value) => value === 'true')
    .catch(false),
  categoriesRequired: z
    .string()
    .transform((value) => value === 'true')
    .catch(false),
});

export type TrackSettingsSaveData = z.infer<typeof TracksSettingsSchema>;
