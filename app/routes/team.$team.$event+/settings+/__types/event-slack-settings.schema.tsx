import { z } from 'zod';

import { text } from '~/routes/__types/utils';

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: text(z.string().url().nullable().default(null)),
});
