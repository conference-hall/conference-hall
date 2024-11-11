import nodemailer from 'nodemailer';

import { isValidEmail } from '../validators/email.ts';
import type { Email, EmailProvider } from './provider.ts';

export class MailpitProvider implements EmailProvider {
  transporter: nodemailer.Transporter;

  constructor(host: string, port: number) {
    this.transporter = nodemailer.createTransport({ host, port });
  }

  public async send(email: Email) {
    const recipientEmails = email.to.filter(isValidEmail);
    if (recipientEmails.length === 0) return;

    try {
      await this.transporter.sendMail({
        from: email.from,
        to: recipientEmails,
        subject: email.subject,
        html: email.html,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
