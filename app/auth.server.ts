import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { captcha } from 'better-auth/plugins';
import { redirect } from 'react-router';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import VerificationEmail from '~/shared/emails/templates/auth/email-verification.tsx';
import ResetPasswordEmail from '~/shared/emails/templates/auth/reset-password.tsx';
import { getLocaleFromRequest } from '~/shared/i18n/i18n.middleware.ts';
import { db } from '../prisma/db.server.ts';
import { EventSpeakers } from './features/event-management/speakers/services/event-speakers.server.ts';

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  experimental: { joins: true },
  plugins: getPlugins(),
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
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      prompt: 'select_account',
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    twitter: {
      prompt: 'select_account',
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
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
      trustedProviders: ['google', 'github', 'twitter', 'email-password'],
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
});

export async function signOut(request: Request, redirectTo?: string, additionalHeaders: Record<string, string> = {}) {
  const { headers } = await auth.api.signOut({ headers: request.headers, returnHeaders: true });
  for (const [key, value] of Object.entries(additionalHeaders)) {
    headers.append(key, value);
  }
  const url = new URL(request.url);
  throw redirect(redirectTo ?? url.pathname, { headers });
}

function getPlugins() {
  const plugins = [];
  if (process.env.CAPTCHA_SECRET_KEY) {
    plugins.push(captcha({ provider: 'cloudflare-turnstile', secretKey: process.env.CAPTCHA_SECRET_KEY! }));
  }
  return plugins;
}

function getPasswordHash() {
  if (process.env.NODE_ENV === 'test') {
    return {
      hash: async (password: string) => password,
      verify: async ({ hash, password }: { hash: string; password: string }) => hash === password,
    };
  }
  return undefined;
}
