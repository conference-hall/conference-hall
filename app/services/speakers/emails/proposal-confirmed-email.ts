import type { Event, Prisma, Proposal } from '@prisma/client';
import { SingleEmail } from '~/services/emails/single-email';

type ConfirmedEmailVariables = { proposalTitle: string };

export class ProposalConfirmedEmail extends SingleEmail<ConfirmedEmailVariables> {
  constructor(event: Event, proposal: Proposal) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Talk confirmed by speaker`,
      template: TEMPLATE,
    });

    if (!this.event.emailOrganizer) return;

    this.addRecipient(this.event.emailOrganizer, { proposalTitle: proposal.title });
  }

  static send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (notifications.includes('confirmed') && event.emailOrganizer) {
      return new ProposalConfirmedEmail(event, proposal).send();
    }
  }
}

const TEMPLATE = `
Hi %eventName%'s organizers,

The talk **%recipient.proposalTitle%** as been confirmed by the speaker.
`;
