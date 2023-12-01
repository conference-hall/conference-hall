import type { Event, Prisma, Proposal } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type EmailVariables = { eventName: string; proposalTitle: string };

export class ProposalDeclinedEmail extends Template {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('declined')) return;
    if (!event.emailOrganizer) return;

    const template = new ProposalDeclinedEmail(`[${event.name}] Talk declined by speaker`, TEMPLATE);

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

Unfortunately, the talk **%recipient.proposalTitle%** as been declined by the speaker.
`;
