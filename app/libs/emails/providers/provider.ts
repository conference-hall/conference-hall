import { config } from '../../config.ts';
import { MailgunProvider } from './mailgun-provider.ts';
import { MailpitProvider } from './mailpit-provider.ts';

export type Email = {
  from: string;
  to: Array<string>;
  cc?: Array<string>;
  bcc?: Array<string>;
  subject: string;
  html: string;
};

export interface ProviderVariables {
  [key: string]: string;
}

export interface RecipientVariables {
  [email: string]: {
    [custom: string]: string;
  };
}

export interface IEmailProvider {
  sendEmail(email: Email, recipientVariables?: RecipientVariables): Promise<void>;

  sendBatchEmail(
    email: Email,
    recipientVariables?: RecipientVariables,
    providerVariables?: ProviderVariables,
  ): Promise<void>;
}

function getEmailProvider(): IEmailProvider {
  if (config.useEmulators) {
    return new MailpitProvider();
  }
  return new MailgunProvider();
}

export const emailProvider = getEmailProvider();
