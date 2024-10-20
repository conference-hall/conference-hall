// Inspired by https://github.com/epicweb-dev/epic-stack
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development']),
  REDIS_URL: z.string(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILPIT_HOST: z.string().optional(),
  MAILPIT_SMTP_PORT: z.coerce.number().optional(),
});

export function getEnv() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);

    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}
