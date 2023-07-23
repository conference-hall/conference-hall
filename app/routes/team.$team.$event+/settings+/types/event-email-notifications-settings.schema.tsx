import { z } from 'zod';

import { text } from '~/routes/__types/utils';

export const EventEmailNotificationsSettingsSchema = z.object({
  emailOrganizer: text(z.string().email().nullable().default(null)),
});
