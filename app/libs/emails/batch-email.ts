import type { Event } from '@prisma/client';

import { emailProvider } from './providers/provider';
import { buildTemplate } from './template/build-template';

export const MAILGUN_DELIBERATION_VARS = {
  'v:type': 'deliberation_email',
  'v:proposalId': '%recipient.proposalId%',
};

type BatchOptions = { enableDeliberationVars: boolean };

export abstract class BatchEmail<R extends Record<string, string>> {
  event: Event;
  from: string;
  subject: string;
  template: string;
  batches: Array<Record<string, R>>;
  options?: BatchOptions;

  constructor({
    event,
    from,
    subject,
    template,
    options,
  }: {
    event: Event;
    from: string;
    subject: string;
    template: string;
    options?: BatchOptions;
  }) {
    this.event = event;
    this.from = from;
    this.subject = subject;
    this.template = template;
    this.batches = [];
    this.options = options;
  }

  addRecipient(email: string, variables: R) {
    const batch = this.batches.find((batch) => !batch[email]);
    if (batch) {
      batch[email] = variables;
    } else {
      this.batches.push({ [email]: variables });
    }
  }

  async send() {
    return Promise.all(
      this.batches.map((recipients) => {
        const emails = Object.keys(recipients);
        return emailProvider.sendBatchEmail(
          {
            from: this.from,
            to: emails,
            subject: this.subject,
            html: buildTemplate(this.subject, this.template, {
              eventName: this.event.name,
              eventSlug: this.event.slug,
            }),
          },
          recipients,
          this.options?.enableDeliberationVars ? MAILGUN_DELIBERATION_VARS : {},
        );
      }),
    );
  }
}
