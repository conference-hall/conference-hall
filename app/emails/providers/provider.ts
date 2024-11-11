import { MailgunProvider } from './mailgun-provider.ts';
import { MailpitProvider } from './mailpit-provider.ts';

export type Email = { from: string; to: string[]; subject: string; html: string };

export interface EmailProvider {
  send: (email: Email) => Promise<void>;
}

type MailConfig = {
  NODE_ENV: string;
  MAILPIT_HOST?: string;
  MAILPIT_SMTP_PORT?: number;
  MAILGUN_API_KEY?: string;
  MAILGUN_DOMAIN?: string;
};

export function getEmailProvider(config: MailConfig): EmailProvider | null {
  const { NODE_ENV, MAILPIT_HOST, MAILPIT_SMTP_PORT, MAILGUN_API_KEY, MAILGUN_DOMAIN } = config;

  if (MAILPIT_HOST && MAILPIT_SMTP_PORT) {
    return new MailpitProvider(MAILPIT_HOST, MAILPIT_SMTP_PORT);
  }

  if (NODE_ENV === 'production' && MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    return new MailgunProvider(MAILGUN_API_KEY, MAILGUN_DOMAIN);
  }

  return null;
}
