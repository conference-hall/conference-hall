import type { Event, Proposal, User } from '@prisma/client';
import { BatchEmail } from '../../emails/batch-email';

type RejectionEmailVariables = { fullname: string; proposalTitle: string };

export class RejectionEmailsBatch extends BatchEmail<RejectionEmailVariables> {
  constructor(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Your talk has been declined`,
      template: TEMPLATE,
    });

    proposals.forEach((proposal) => {
      proposal.speakers.forEach((speaker) => {
        if (!speaker.email) return;
        this.addRecipient(speaker.email, { fullname: speaker.name || '', proposalTitle: proposal.title });
      });
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
