import { getEnv } from '../env/env';
import { MailgunProvider } from './mailgun-provider';
import { MailpitProvider } from './mailpit-provider';

export type Email = { from: string; to: string[]; bcc?: string[]; subject: string; html: string };

export interface EmailProvider {
  send: (email: Email) => Promise<void>;
}

const env = getEnv();

function getEmailProvider(): EmailProvider | null {
  if (env.MAILPIT_HOST && env.MAILPIT_SMTP_PORT) {
    return new MailpitProvider(env.MAILPIT_HOST, env.MAILPIT_SMTP_PORT);
  }

  if (env.NODE_ENV === 'production' && env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    return new MailgunProvider(env.MAILGUN_API_KEY, env.MAILGUN_DOMAIN);
  }

  return null;
}

export const emailProvider = getEmailProvider();
