import type { Event } from '@prisma/client';
import { BatchEmail } from '../../emails/batch-email';

type RejectionEmailVariables = { fullname: string; proposalTitle: string };

export class RejectionEmailsBatch extends BatchEmail<RejectionEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Your talk has been declined`,
      template: TEMPLATE,
    });
  }
}

const TEMPLATE = `
Dear %recipient.fullname%,

Your talk **%recipient.proposalTitle%** at **%eventName%** has been declined.

We had lots of excellent talks this year and choosing among them has been heart-breaking. 😓 

Thank you very much for your submission and please consider submitting again next year.

%eventName% team.
`;
