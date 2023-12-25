import { MailgunProvider } from './mailgun-provider';
import { MailpitProvider } from './mailpit-provider';

export type Email = { from: string; to: string[]; bcc?: string[]; subject: string; html: string };

export interface EmailProvider {
  send: (email: Email) => Promise<void>;
}

function getEmailProvider(): EmailProvider | null {
  const { USE_EMULATORS, MAILPIT_HOST, MAILPIT_SMTP_PORT, MAILGUN_API_KEY, MAILGUN_DOMAIN } = process.env;

  if (USE_EMULATORS && MAILPIT_HOST && MAILPIT_SMTP_PORT) {
    return new MailpitProvider(MAILPIT_HOST, MAILPIT_SMTP_PORT);
  } else if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    return new MailgunProvider(MAILGUN_API_KEY, MAILGUN_DOMAIN);
  } else {
    return null;
  }
}

export const emailProvider = getEmailProvider();
