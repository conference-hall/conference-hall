import { z } from 'zod';

export const TeamAccessRequestSchema = z.object({
  eventName: z.string().trim().min(1).max(200),
  email: z.email(),
  'cf-turnstile-response': z.string().optional().default(''),
});
