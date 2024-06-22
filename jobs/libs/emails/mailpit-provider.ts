import nodemailer from 'nodemailer';

import { EmailValidator } from './email-validator.ts';
import type { Email, EmailProvider } from './provider';

export class MailpitProvider implements EmailProvider {
  transporter: nodemailer.Transporter;

  constructor(host: string, port: number) {
    this.transporter = nodemailer.createTransport({ host, port });
  }

  public async send(email: Email) {
    const recipientEmails = email.to.filter(EmailValidator.isValid);
    if (recipientEmails.length === 0) return;

    try {
      await this.transporter.sendMail({
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
