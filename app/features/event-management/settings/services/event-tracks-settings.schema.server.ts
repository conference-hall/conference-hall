import { z } from 'zod';
import { HEX_COLOR_REGEX } from '~/shared/colors/colors.ts';

const TrackSaveSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(255),
});

export const CategorySaveSchema = TrackSaveSchema.extend({
  color: z.string().trim().regex(HEX_COLOR_REGEX).optional(),
});

export type CategorySaveData = z.infer<typeof CategorySaveSchema>;

export const FormatSaveSchema = TrackSaveSchema.extend({
  durationInMinutes: z.coerce.number().int().min(1).max(1440).optional(),
});

export type FormatSaveData = z.infer<typeof FormatSaveSchema>;

export const TracksSettingsSchema = z.object({
  formatsRequired: z.stringbool(),
  formatsAllowMultiple: z.stringbool(),
  categoriesRequired: z.stringbool(),
  categoriesAllowMultiple: z.stringbool(),
});

export const TrackReorderSchema = z.object({
  trackId: z.string(),
  direction: z.enum(['up', 'down']),
});
