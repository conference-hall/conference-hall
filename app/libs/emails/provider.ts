import { config } from '../config';
import { MailgunProvider } from './mailgun-provider';
import { MailpitProvider } from './mailpit-provider';

export type Email = { from: string; to: string[]; bcc?: string[]; subject: string; html: string };

export interface EmailProvider {
  send: (email: Email) => Promise<void>;
}

function getEmailProvider(): EmailProvider {
  if (config.useEmulators) {
    return new MailpitProvider(config.MAILPIT_HOST, config.MAILPIT_SMTP_PORT);
  }
  return new MailgunProvider(config.MAILGUN_API_KEY, config.MAILGUN_DOMAIN);
}

export const emailProvider = getEmailProvider();
