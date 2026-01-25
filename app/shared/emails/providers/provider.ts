import { getJobServerEnv, getSharedServerEnv } from '../../../../servers/environment.server.ts';
import { MailgunProvider } from './mailgun-provider.ts';
import { MailpitProvider } from './mailpit-provider.ts';

const { NODE_ENV } = getSharedServerEnv();
const { MAILPIT_HOST, MAILPIT_SMTP_PORT, MAILGUN_API_KEY, MAILGUN_DOMAIN } = getJobServerEnv();

export type Email = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
};

export interface EmailProvider {
  send: (email: Email) => Promise<void>;
}

export function getEmailProvider(): EmailProvider | null {
  if (MAILPIT_HOST && MAILPIT_SMTP_PORT) {
    return new MailpitProvider(MAILPIT_HOST, MAILPIT_SMTP_PORT);
  }

  if (NODE_ENV === 'production' && MAILGUN_API_KEY && MAILGUN_DOMAIN) {
    return new MailgunProvider(MAILGUN_API_KEY, MAILGUN_DOMAIN);
  }

  return null;
}
