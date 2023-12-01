import { config } from '../config';
import { MailgunProvider } from './mailgun-provider';
import { MailpitProvider } from './mailpit-provider';
import type { Template } from './template/template';

export interface EmailVariables {
  [key: string]: string | number | boolean;
}

export interface EmailProvider {
  send: <T extends EmailVariables>(
    from: string,
    recipients: { to: string[]; bcc?: string[]; variables: T }[],
    template: Template,
  ) => Promise<void>;
}

function getEmailProvider(): EmailProvider {
  if (config.useEmulators) {
    return new MailpitProvider(config.MAILPIT_HOST, config.MAILPIT_SMTP_PORT);
  }
  return new MailgunProvider(config.MAILGUN_API_KEY, config.MAILGUN_DOMAIN);
}

export const emailProvider = getEmailProvider();
