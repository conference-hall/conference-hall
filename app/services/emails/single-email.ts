import type { Event } from '@prisma/client';
import { emailProvider } from './providers/provider';
import { buildTemplate } from './template/build-template';

export abstract class SingleEmail<R extends Record<string, string>> {
  event: Event;
  from: string;
  bcc: string[];
  subject: string;
  template: string;
  recipients: Record<string, R>;

  constructor({ event, from, subject, template }: { event: Event; from: string; subject: string; template: string }) {
    this.event = event;
    this.from = from;
    this.subject = subject;
    this.template = template;
    this.recipients = {};
    this.bcc = [];
  }

  addBcc(email: string) {
    this.bcc.push(email);
  }

  addRecipient(email: string, variables: R) {
    this.recipients[email] = variables;
  }

  async send() {
    const emails = Object.keys(this.recipients);
    return emailProvider.sendEmail(
      {
        from: this.from,
        to: emails,
        bcc: this.bcc,
        subject: this.subject,
        html: buildTemplate(this.subject, this.template, {
          eventName: this.event.name,
          eventSlug: this.event.slug,
        }),
      },
      this.recipients
    );
  }
}
