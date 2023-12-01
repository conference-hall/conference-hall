import formData from 'form-data';
import Mailgun from 'mailgun.js';
import type { IMailgunClient } from 'mailgun.js/Interfaces';

import { EmailValidator } from './email-validator';
import type { EmailProvider, EmailVariables } from './provider';
import type { Template } from './template/template';

export class MailgunProvider implements EmailProvider {
  private client: IMailgunClient;
  private domain: string;

  constructor(key: string, domain: string) {
    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({ username: 'api', key });
    this.domain = domain;
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
        await this.client.messages.create(this.domain, {
          from,
          to: recipientEmails,
          bcc: bcc,
          subject: template.renderSubject(variables),
          html: template.renderHtmlContent(variables),
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
