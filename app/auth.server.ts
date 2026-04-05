import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { captcha, testUtils } from 'better-auth/plugins';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import VerificationEmail from '~/shared/emails/templates/auth/email-verification.tsx';
import ResetPasswordEmail from '~/shared/emails/templates/auth/reset-password.tsx';
import { getLocaleFromRequest } from '~/shared/i18n/i18n.middleware.ts';
import { db } from '../prisma/db.server.ts';
import { getSharedServerEnv, getWebServerEnv } from '../servers/environment.server.ts';
import { EventSpeakers } from './features/event-management/speakers/services/event-speakers.server.ts';
import {
  isFirebasePasswordHash,
  verifyFirebaseScryptPassword,
} from './shared/authentication/firebase-scrypt.server.ts';
import { getRedisClient } from './shared/cache/redis.server.ts';
import { logger } from './shared/logger/logger.server.ts';

const { NODE_ENV, APP_URL } = getSharedServerEnv();
const webEnv = getWebServerEnv();

export const auth = betterAuth({
  baseURL: APP_URL,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  experimental: { joins: true },
  secondaryStorage: getSecondaryStorage(),
  plugins: getPlugins(),
  logger: {
    log: (level, message, ...metadata) => {
      logger[level](message, metadata.length > 0 ? { metadata } : undefined);
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: getPasswordHash(),
    sendResetPassword: async ({ user, url }, request) => {
      const locale = await getLocaleFromRequest(request);
      void sendEmail.trigger(ResetPasswordEmail.buildPayload(user.email, locale, { passwordResetUrl: url }));
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = await getLocaleFromRequest(request);
      void sendEmail.trigger(VerificationEmail.buildPayload(user.email, locale, { emailVerificationUrl: url }));
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: webEnv.GOOGLE_CLIENT_ID!,
      clientSecret: webEnv.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      prompt: 'select_account',
      clientId: webEnv.GITHUB_CLIENT_ID!,
      clientSecret: webEnv.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    changeEmail: { enabled: true },
    fields: { image: 'picture' },
    additionalFields: {
      locale: { type: 'string', required: false, defaultValue: 'en' },
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      trustedProviders: ['google', 'github', 'email-password'],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // set user locale when user signs up
          const locale = await getLocaleFromRequest(ctx?.request);
          return { data: { ...user, locale } };
        },
      },
      update: {
        after: async (user, ctx) => {
          if (ctx?.path === '/verify-email') {
            // update event-speakers email when it is changed
            await EventSpeakers.updateEmailForUser(user.id, user.email);
          }
        },
      },
    },
  },
  rateLimit: {
    storage: 'secondary-storage',
  },
  advanced: {
    // ip address check for rate limit
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'X-Forwarded-For'],
    },
  },
});

function getSecondaryStorage() {
  const redis = getRedisClient();
  return {
    get: async (key: string) => {
      return await redis.get(`auth:${key}`);
    },
    set: async (key: string, value: string, ttl?: number | undefined) => {
      if (ttl) await redis.set(`auth:${key}`, value, 'EX', ttl);
      else await redis.set(`auth:${key}`, value);
    },
    delete: async (key: string) => {
      await redis.del(`auth:${key}`);
    },
  };
}

function getPlugins() {
  const plugins = [];
  if (webEnv.CAPTCHA_SECRET_KEY) {
    plugins.push(captcha({ provider: 'cloudflare-turnstile', secretKey: webEnv.CAPTCHA_SECRET_KEY }));
  }
  if (NODE_ENV === 'test') {
    plugins.push(testUtils());
  }
  return plugins;
}

function getPasswordHash() {
  if (NODE_ENV === 'test') {
    return {
      hash: async (password: string) => password,
      verify: async ({ hash, password }: { hash: string; password: string }) => hash === password,
    };
  }
  return {
    hash: hashPassword,
    verify: async ({ hash, password }: { hash: string; password: string }): Promise<boolean> => {
      if (isFirebasePasswordHash(hash)) {
        return verifyFirebaseScryptPassword(hash, password);
      }
      return verifyPassword({ hash, password });
    },
  };
}
