import { getJobServerEnv, getSharedServerEnv } from 'servers/environment.server.ts';
import { MailgunProvider } from './mailgun-provider.ts';
import { MailpitProvider } from './mailpit-provider.ts';

const sharedEnv = getSharedServerEnv();
const jobEnv = getJobServerEnv();

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
  if (jobEnv.MAILPIT_HOST && jobEnv.MAILPIT_SMTP_PORT) {
    return new MailpitProvider(jobEnv.MAILPIT_HOST, jobEnv.MAILPIT_SMTP_PORT);
  }

  if (sharedEnv.NODE_ENV === 'production' && jobEnv.MAILGUN_API_KEY && jobEnv.MAILGUN_DOMAIN) {
    return new MailgunProvider(jobEnv.MAILGUN_API_KEY, jobEnv.MAILGUN_DOMAIN);
  }

  return null;
}
