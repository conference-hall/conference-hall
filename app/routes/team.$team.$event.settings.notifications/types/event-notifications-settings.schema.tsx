import { z } from 'zod';
import { repeatable } from '~/schemas/utils';

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: repeatable(),
});
