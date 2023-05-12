import type { Event, Proposal, User } from '@prisma/client';
import { BatchEmail } from '../../../../libs/emails/batch-email';

type ProposalRejectedEmailVariables = { fullname: string; proposalTitle: string };

export class ProposalRejectedEmailsBatch extends BatchEmail<ProposalRejectedEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Your talk has been declined`,
      template: TEMPLATE,
    });
  }

  static send(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    const email = new ProposalRejectedEmailsBatch(event);

    proposals.forEach((proposal) => {
      proposal.speakers.forEach((speaker) => {
        if (!speaker.email) return;
        email.addRecipient(speaker.email, { fullname: speaker.name || '', proposalTitle: proposal.title });
      });
    });

    return email.send();
  }
}

const TEMPLATE = `
Dear %recipient.fullname%,

Your talk **%recipient.proposalTitle%** at **%eventName%** has been declined.

We had lots of excellent talks this year and choosing among them has been heart-breaking. 😓 

Thank you very much for your submission and please consider submitting again next year.

%eventName% team.
`;
