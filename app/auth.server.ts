import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { captcha } from 'better-auth/plugins';
import { redirect } from 'react-router';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import VerificationEmail from '~/shared/emails/templates/auth/email-verification.tsx';
import ResetPasswordEmail from '~/shared/emails/templates/auth/reset-password.tsx';
import { getLocaleFromRequest } from '~/shared/i18n/i18n.middleware.ts';
import { db } from '../prisma/db.server.ts';

const plugins = [];
if (process.env.CAPTCHA_SECRET_KEY) {
  plugins.push(captcha({ provider: 'cloudflare-turnstile', secretKey: process.env.CAPTCHA_SECRET_KEY! }));
}

const isTestEnv = process.env.NODE_ENV === 'test';

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: isTestEnv
      ? {
          hash: async (password: string) => password,
          verify: async ({ hash, password }: { hash: string; password: string }) => hash === password,
        }
      : undefined,
    sendResetPassword: async ({ user, url }, request) => {
      const locale = request ? await getLocaleFromRequest(request) : null;
      void sendEmail.trigger(ResetPasswordEmail.buildPayload(user.email, locale || 'en', { passwordResetUrl: url }));
    },
  },
  plugins,
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
    fields: { image: 'picture' },
    additionalFields: {
      // todo(auth): how to save default locale on user signup?
      locale: { type: 'string', required: false, defaultValue: 'en' },
    },
    changeEmail: {
      enabled: true,
      // todo(auth): add sendChangeEmailConfirmation?
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
      updateUserInfoOnLink: true, // todo(auth): keep?
      trustedProviders: ['google', 'github', 'twitter', 'email-password'],
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = request ? await getLocaleFromRequest(request) : null;
      void sendEmail.trigger(VerificationEmail.buildPayload(user.email, locale || 'en', { emailVerificationUrl: url }));
    },
  },
  databaseHooks: {
    user: {
      update: {
        after: async (user, ctx) => {
          if (ctx?.path === '/verify-email') {
            // update event-speakers email when it is changed
            // todo(auth): put in a service + add tests
            await db.eventSpeaker.updateMany({ data: { email: user.email }, where: { userId: user.id } });
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
