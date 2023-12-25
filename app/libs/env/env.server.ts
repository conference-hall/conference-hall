import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['production', 'development']),
  USE_EMULATORS: z.string().optional(),
  PROTOCOL: z.string(),
  DOMAIN: z.string(),
  PORT: z.string().optional(),
  REDIS_URL: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string(),
  FIREBASE_STORAGE: z.string(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  COOKIE_SIGNED_SECRET: z.string(),
  SENTRY_DSN: z.string(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILPIT_HOST: z.string().optional(),
  MAILPIT_SMTP_PORT: z.number().optional(),
  MAILPIT_HTTP_PORT: z.number().optional(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function initEnvironment() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);

    throw new Error('Invalid environment variables');
  }

  global.ENV = getPublicEnv();
}

/**
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getPublicEnv() {
  return {
    MODE: process.env.NODE_ENV,
    USE_EMULATORS: process.env.USE_EMULATORS === 'true',
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    SENTRY_DSN: process.env.SENTRY_DSN,
  };
}

export function appUrl() {
  const { PROTOCOL, DOMAIN, PORT } = process.env;
  if (!PORT) return `${PROTOCOL}://${DOMAIN}`;
  return `${PROTOCOL}://${DOMAIN}:${PORT}`;
}

type ENV = ReturnType<typeof getPublicEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}