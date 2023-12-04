import { z } from 'zod';

export const PublishResultSchema = z.enum(['accepted', 'rejected']);

export const PublishResultFormSchema = z.object({
  sendEmails: z.boolean().default(false),
});
