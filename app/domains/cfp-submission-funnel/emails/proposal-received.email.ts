import type { Event, Prisma, Proposal } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type EmailVariables = { proposalTitle: string };

export class ProposalReceivedEmail extends Template {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('submitted')) return;
    if (!event.emailOrganizer) return;

    const template = new ProposalReceivedEmail(`[${event.name}] New proposal received`, TEMPLATE);

    const recipient = {
      to: [event.emailOrganizer],
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    };
    await emailProvider.send<EmailVariables>(`${event.name} <no-reply@conference-hall.io>`, [recipient], template);
  }
}

const TEMPLATE = `
Hi,

The talk **%proposalTitle%** has been submitted for %eventName%.

Thanks!
`;
