import { z } from 'zod';

export const EventTracksSettingsSchema = z.object({
  formatsRequired: z
    .string()
    .transform((value) => value === 'true')
    .catch(false),
  categoriesRequired: z
    .string()
    .transform((value) => value === 'true')
    .catch(false),
});
