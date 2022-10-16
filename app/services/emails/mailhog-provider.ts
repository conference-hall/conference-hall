import nodemailer from 'nodemailer';
import { config } from '../config';
import type { Email, IEmailProvider, RecipientVariables } from './provider';

export class MailhogProvider implements IEmailProvider {
  transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.MAILHOG_HOST,
      port: config.MAILHOG_PORT,
    });
  }

  async sendEmail(data: Email) {
    try {
      await this.transporter.sendMail({
        from: data.from,
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
        subject: data.subject,
        html: data.html,
      });
    } catch (error) {
      console.error(`Error sending email: ${error}`);
    }
  }

  async sendBatchEmail(data: Email, recipientVariables: RecipientVariables = {}) {
    await Promise.all(
      Object.keys(recipientVariables).map((email) =>
        this.sendEmail({
          from: data.from,
          to: [email],
          cc: data.cc,
          bcc: data.bcc,
          subject: data.subject,
          html: replaceVariablesInTemplate(data.html, recipientVariables[email]),
        })
      )
    );
  }
}

function replaceVariablesInTemplate(template: string, variables: { [key: string]: string }) {
  return Object.keys(variables).reduce((template, key) => {
    const regexp = new RegExp(`%recipient.${key}%`, 'g');
    return template.replace(regexp, variables[key]);
  }, template);
}
