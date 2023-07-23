import { z } from 'zod';

import { repeatable } from '~/routes/__types/utils';

export const EventNotificationsSettingsSchema = z.object({
  emailNotifications: repeatable(),
});
