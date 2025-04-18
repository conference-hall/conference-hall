import { z } from 'zod';

const schema = z.object({
  TZ: z.string(),
  NODE_ENV: z.enum(['production', 'development', 'test']),
  USE_EMULATORS: z.string().optional(),
  APP_URL: z.string(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_STORAGE: z.string(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  FIREBASE_STORAGE_EMULATOR_HOST: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  COOKIE_SIGNED_SECRET: z.string(),
  MAINTENANCE_ENABLED: z.string().optional(),
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

  global.ENV = getBrowserEnv();
}

/**
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getBrowserEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    USE_EMULATORS: process.env.USE_EMULATORS === 'true',
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    I18N_HASH: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
  };
}

export function appUrl() {
  return process.env.APP_URL;
}

type ENV = ReturnType<typeof getBrowserEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
