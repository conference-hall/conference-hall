import { z } from 'zod';
import { text } from 'zod-form-data';

export const EventEmailNotificationsSettingsSchema = z.object({
  emailOrganizer: text(z.string().email().nullable().default(null)),
});
