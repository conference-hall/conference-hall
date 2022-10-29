import type { Event } from '@prisma/client';
import { BatchEmail } from '../../emails/batch-email';

type AcceptationEmailVariables = { fullname: string; proposalId: string; proposalTitle: string };

export class AcceptationEmailsBatch extends BatchEmail<AcceptationEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Your talk has been accepted`,
      template: TEMPLATE,
    });
  }
}

const TEMPLATE = `
Dear %recipient.fullname%,

Your talk **%recipient.proposalTitle%** at **%eventName%** has been accepted.

In order to help organizers for the selection and the event management, you can confirm or decline your participation to %eventName%.

[**Please confirm or decline.**](%appUrl%/%eventSlug%/proposals/%recipient.proposalId%)

See you there!

%eventName% team.
`;
