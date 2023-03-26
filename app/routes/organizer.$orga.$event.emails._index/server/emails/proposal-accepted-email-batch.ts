import type { Event, Proposal, User } from '@prisma/client';
import { BatchEmail } from '../../../../libs/emails/batch-email';

type ProposalAcceptedEmailVariables = { fullname: string; proposalId: string; proposalTitle: string };

export class ProposalAcceptedEmailsBatch extends BatchEmail<ProposalAcceptedEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Your talk has been accepted`,
      template: TEMPLATE,
    });
  }

  static send(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    const email = new ProposalAcceptedEmailsBatch(event);

    proposals.forEach((proposal) => {
      proposal.speakers.forEach((speaker) => {
        if (!speaker.email) return;
        email.addRecipient(speaker.email, {
          fullname: speaker.name || '',
          proposalId: proposal.id,
          proposalTitle: proposal.title,
        });
      });
    });

    return email.send();
  }
}

const TEMPLATE = `
Hi %recipient.fullname%,

Your talk **%recipient.proposalTitle%** at **%eventName%** has been accepted.

In order to help organizers for the selection and the event management, you can confirm or decline your participation to %eventName%.

[**Please confirm or decline.**](%appUrl%/%eventSlug%/proposals/%recipient.proposalId%)

See you there!

%eventName% team.
`;
