import { config } from '../../config';
import { MailgunProvider } from './mailgun-provider';
import { MailhogProvider } from './mailhog-provider';

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
  sendEmail(email: Email, providerVariables?: ProviderVariables): Promise<void>;

  sendBatchEmail(
    email: Email,
    recipientVariables?: RecipientVariables,
    providerVariables?: ProviderVariables
  ): Promise<void>;
}

function getEmailProvider(): IEmailProvider {
  if (config.isProduction) {
    return new MailgunProvider();
  }
  return new MailhogProvider();
}

export const emailProvider = getEmailProvider();
