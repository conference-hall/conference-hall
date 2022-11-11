import type { Event, Prisma, Proposal } from '@prisma/client';
import { SingleEmail } from '~/services/emails/single-email';

type DeclinedEmailVariables = { proposalTitle: string };

export class ProposalDeclinedEmail extends SingleEmail<DeclinedEmailVariables> {
  constructor(event: Event, proposal: Proposal) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Talk declined by speaker 😔`,
      template: TEMPLATE,
    });

    if (!this.event.emailOrganizer) return;

    this.addRecipient(this.event.emailOrganizer, { proposalTitle: proposal.title });
  }

  static send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (notifications.includes('declined') && event.emailOrganizer) {
      return new ProposalDeclinedEmail(event, proposal).send();
    }
  }
}

const TEMPLATE = `
Hi %eventName%'s organizers,

Unfortunately, the talk **%recipient.proposalTitle%** as been declined by the speaker.
`;
