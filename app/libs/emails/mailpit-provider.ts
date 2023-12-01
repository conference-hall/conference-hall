import nodemailer from 'nodemailer';

import { EmailValidator } from './email-validator';
import type { EmailProvider, EmailVariables } from './provider';
import type { Template } from './template/template';

export class MailpitProvider implements EmailProvider {
  transporter: nodemailer.Transporter;

  constructor(host: string, port: number) {
    this.transporter = nodemailer.createTransport({ host, port });
  }

  public async send<T extends EmailVariables>(
    from: string,
    recipients: { to: string[]; bcc?: string[]; variables: T }[],
    template: Template,
  ) {
    for (const { to, bcc, variables } of recipients) {
      const recipientEmails = to.filter(EmailValidator.isValid);
      if (recipientEmails.length === 0) continue;

      try {
        await this.transporter.sendMail({
          from,
          to: recipientEmails,
          bcc,
          subject: template.renderSubject(variables),
          html: template.renderHtmlContent(variables),
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
