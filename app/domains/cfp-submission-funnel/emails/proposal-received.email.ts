import type { Event, Prisma, Proposal } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type Variables = { eventName: string; proposalTitle: string };

export class ProposalReceivedEmail {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications as Prisma.JsonArray) || [];
    if (!notifications.includes('submitted')) return;
    if (!event.emailOrganizer) return;

    const template = new Template<Variables>({
      subject: `[${event.name}] New proposal received`,
      content: TEMPLATE,
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    });

    await emailProvider.send({
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: [event.emailOrganizer],
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `
Hi,

The talk **%proposalTitle%** has been submitted for %eventName%.

Thanks!
`;
