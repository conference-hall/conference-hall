/** biome-ignore-all lint/style/noProcessEnv: process.env should only be used here */

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

let environmentLoaded = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __projectRoot = findProjectRoot(__dirname);

const SharedServerSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  TZ: z.string(),
  CI: z.stringbool().optional().default(false),
  VITEST: z.stringbool().optional().default(false),
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
  const env = loadEnvironment();
  const envData = schema.safeParse(env);

  if (!envData.success) {
    console.error('❌ Invalid environment variables:');
    console.error(z.prettifyError(envData.error));
    throw new Error('Invalid environment variables');
  }
  return envData.data;
}

export function loadEnvironment() {
  const { NODE_ENV, CI } = process.env;
  if (environmentLoaded) return process.env;
  if (NODE_ENV === 'production') return process.env;

  if (CI || NODE_ENV === 'test') {
    process.loadEnvFile(resolve(__projectRoot, 'tests/.env.test'));
  }
  process.loadEnvFile(resolve(__projectRoot, '.env.local'));

  environmentLoaded = true;
  return process.env;
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

function findProjectRoot(startDir: string) {
  let current = startDir;
  while (true) {
    const pkgPath = join(current, 'package.json');
    if (existsSync(pkgPath)) return current;

    const parent = dirname(current);
    if (parent === current) throw new Error('Could not find project root');

    current = parent;
  }
}
