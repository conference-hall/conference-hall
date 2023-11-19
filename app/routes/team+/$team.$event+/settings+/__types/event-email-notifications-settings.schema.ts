import { z } from 'zod';

export const EventEmailNotificationsSettingsSchema = z.object({
  emailOrganizer: z.string().email().nullable().default(null),
});
