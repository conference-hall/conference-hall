import { z } from 'zod';

import { text } from '~/schemas/utils';

export const EventEmailNotificationsSettingsSchema = z.object({
  emailOrganizer: text(z.string().email().nullable().default(null)),
});
