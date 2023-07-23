import { z } from 'zod';

import { text } from '~/schemas/utils';

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: text(z.string().url().nullable().default(null)),
});
