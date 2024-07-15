import { z } from 'zod';

export const PublishResultFormSchema = z.object({
  type: z.enum(['ACCEPTED', 'REJECTED']),
  sendEmails: z.boolean().default(false),
});
