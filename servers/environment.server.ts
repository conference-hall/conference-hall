import { z } from 'zod';

const SharedServerSchema = z.object({
  TZ: z.string(),
  CI: z.stringbool().optional().default(false),
  VITEST: z.stringbool().optional().default(false),
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  APP_URL: z.url(),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
});

const WebServerSchema = z.object({
  HOST: z.string().optional().default('localhost'),
  PORT: z.coerce.number().optional().default(3000),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_STORAGE: z.string(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  FIREBASE_STORAGE_EMULATOR_HOST: z.string().optional(),
  COOKIE_SIGNED_SECRET: z.string(),
  MAINTENANCE_ENABLED: z.stringbool().optional().default(false),
  CAPTCHA_SITE_KEY: z.string().optional(),
  CAPTCHA_SECRET_KEY: z.string().optional(),
});

const JobServerSchema = z.object({
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILPIT_HOST: z.string().optional(),
  MAILPIT_SMTP_PORT: z.coerce.number().optional(),
});

type SharedServerEnv = z.infer<typeof SharedServerSchema>;
let sharedServerEnv: SharedServerEnv;

type WebServerEnv = z.infer<typeof WebServerSchema>;
let webServerEnv: WebServerEnv;

type JobServerEnv = z.infer<typeof JobServerSchema>;
let jobServerEnv: JobServerEnv;

function initEnv<T extends z.ZodType>(schema: T): z.infer<T> {
  // biome-ignore lint/style/noProcessEnv: process.env should only be used here
  const envData = schema.safeParse(process.env);

  if (!envData.success) {
    console.error('❌ Invalid environment variables:');
    console.error(z.prettifyError(envData.error));
    throw new Error('Invalid environment variables');
  }

  return envData.data;
}

export function getSharedServerEnv() {
  if (sharedServerEnv) return sharedServerEnv;
  sharedServerEnv = initEnv(SharedServerSchema);
  Object.freeze(sharedServerEnv);
  return sharedServerEnv;
}

export function getWebServerEnv() {
  if (webServerEnv) return webServerEnv;
  webServerEnv = initEnv(WebServerSchema);
  Object.freeze(webServerEnv);
  return webServerEnv;
}

export function getJobServerEnv() {
  if (jobServerEnv) return jobServerEnv;
  jobServerEnv = initEnv(JobServerSchema);
  Object.freeze(jobServerEnv);
  return jobServerEnv;
}
