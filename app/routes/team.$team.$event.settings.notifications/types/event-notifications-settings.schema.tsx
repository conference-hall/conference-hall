import { z } from 'zod';
import { repeatable } from 'zod-form-data';

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: repeatable(z.array(z.string())),
});
