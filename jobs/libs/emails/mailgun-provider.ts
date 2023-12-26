import formData from 'form-data';
import Mailgun from 'mailgun.js';
import type { IMailgunClient } from 'mailgun.js/Interfaces';

import { EmailValidator } from './email-validator';
import type { Email, EmailProvider } from './provider';

export class MailgunProvider implements EmailProvider {
  private client: IMailgunClient;
  private domain: string;

  constructor(key: string, domain: string) {
    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({ username: 'api', key });
    this.domain = domain;
  }

  public async send(email: Email) {
    const recipientEmails = email.to.filter(EmailValidator.isValid);
    if (recipientEmails.length === 0) return;

    try {
      await this.client.messages.create(this.domain, {
        from: email.from,
        to: recipientEmails,
        bcc: email.bcc,
        subject: email.subject,
        html: email.html,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
