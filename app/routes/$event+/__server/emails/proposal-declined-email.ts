import type { Event, Prisma, Proposal } from '@prisma/client';

import { SingleEmail } from '~/libs/emails/single-email';

type ProposalDeclinedEmailVariables = { proposalTitle: string };

export class ProposalDeclinedEmail extends SingleEmail<ProposalDeclinedEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Talk declined by speaker`,
      template: TEMPLATE,
    });
  }

  static send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('declined')) return;
    if (!event.emailOrganizer) return;

    const email = new ProposalDeclinedEmail(event);
    email.addRecipient(event.emailOrganizer, { proposalTitle: proposal.title });
    return email.send();
  }
}

const TEMPLATE = `
Hi %eventName%'s organizers,

Unfortunately, the talk **%recipient.proposalTitle%** as been declined by the speaker.
`;
