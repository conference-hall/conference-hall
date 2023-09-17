import type { Event, Prisma, Proposal } from '@prisma/client';

import { SingleEmail } from '~/libs/emails/single-email.ts';

type ProposalReceivedEmailVariables = { proposalTitle: string };

export class ProposalReceivedEmail extends SingleEmail<ProposalReceivedEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] New proposal received`,
      template: TEMPLATE,
    });
  }

  static send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('submitted')) return;
    if (!event.emailOrganizer) return;

    const email = new ProposalReceivedEmail(event);
    email.addRecipient(event.emailOrganizer, { proposalTitle: proposal.title });
    return email.send();
  }
}

const TEMPLATE = `
Hi %recipient.fullname%,

The talk **%recipient.proposalTitle%** has been submitted.

Thanks!
`;
