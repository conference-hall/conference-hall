import type { Event, Prisma, Proposal } from '@prisma/client';
import { SingleEmail } from '~/libs/emails/single-email';

type ProposalConfirmedEmailVariables = { proposalTitle: string };

export class ProposalConfirmedEmail extends SingleEmail<ProposalConfirmedEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Talk confirmed by speaker`,
      template: TEMPLATE,
    });
  }

  static send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('confirmed')) return;
    if (!event.emailOrganizer) return;

    const email = new ProposalConfirmedEmail(event);
    email.addRecipient(event.emailOrganizer, { proposalTitle: proposal.title });
    return email.send();
  }
}

const TEMPLATE = `
Hi %eventName%'s organizers,

The talk **%recipient.proposalTitle%** as been confirmed by the speaker.
`;
