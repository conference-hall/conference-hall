import type { Event, Prisma, Proposal } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type EmailVariables = { eventName: string; proposalTitle: string };

export class ProposalConfirmedEmail extends Template {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('confirmed')) return;
    if (!event.emailOrganizer) return;

    const template = new ProposalConfirmedEmail(`[${event.name}] Talk confirmed by speaker`, TEMPLATE);

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
Hi %eventName%'s organizers,

The talk **%recipient.proposalTitle%** as been confirmed by the speaker.
`;
