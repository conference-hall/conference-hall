import { z } from 'zod';

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: z.array(z.string()),
});
