import Mailgun from 'mailgun.js';
import type { IMailgunClient } from 'mailgun.js/Interfaces';
import { isValidEmail } from '../utils/email.ts';
import type { Email, EmailProvider } from './provider.ts';

export class MailgunProvider implements EmailProvider {
  private client: IMailgunClient;
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
      await this.client.messages.create(this.domain, {
        from: email.from,
        to: recipientEmails,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
