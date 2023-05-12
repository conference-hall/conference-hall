import { z } from 'zod';
import { text } from 'zod-form-data';

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: text(z.string().url().nullable().default(null)),
});
