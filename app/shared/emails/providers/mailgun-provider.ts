import Mailgun from 'mailgun.js';
import type { Interfaces } from 'mailgun.js/definitions';
import { logger } from '~/shared/logger/logger.server.ts';
import { isValidEmail } from '../utils/email.ts';
import type { Email, EmailProvider } from './provider.ts';

export class MailgunProvider implements EmailProvider {
  private client: Interfaces.IMailgunClient;
  private domain: string;

  constructor(key: string, domain: string) {
    const mailgun = new Mailgun(FormData);
    this.client = mailgun.client({ username: 'api', key });
    this.domain = domain;
  }

  public async send(email: Email) {
    const recipientEmails = email.to.filter(isValidEmail);
    if (recipientEmails.length === 0) return;

    try {
      // Mailgun exposes custom headers via `h:`-prefixed keys.
      const customHeaders = Object.fromEntries(
        Object.entries(email.headers ?? {}).map(([key, value]) => [`h:${key}`, value]),
      );

      await this.client.messages.create(this.domain, {
        from: email.from,
        to: recipientEmails,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...customHeaders,
      });
    } catch (error) {
      logger.error('Error sending email', { error });
    }
  }
}
