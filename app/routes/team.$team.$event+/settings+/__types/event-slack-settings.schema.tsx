import { z } from 'zod';

export const EventSlackSettingsSchema = z.object({
  slackWebhookUrl: z.string().url().nullable().default(null),
});
