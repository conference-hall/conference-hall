import type { Event, Prisma, Proposal } from '@prisma/client';
import { EmailQueue } from 'jobs/email/email.queue';

import { Template } from '~/libs/email-template/template';
import { EventEmailNotificationsKeys } from '~/types/notifications.types';

type Variables = { eventName: string; proposalTitle: string };

export class ProposalConfirmedEmail {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications || []) as EventEmailNotificationsKeys;
    if (!notifications.includes('confirmed')) return;
    if (!event.emailOrganizer) return;

    const template = new Template<Variables>({
      subject: `[${event.name}] Talk confirmed by speaker`,
      content: TEMPLATE,
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    });

    await EmailQueue.get().enqueue('proposal-confirmed-email', {
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: [event.emailOrganizer],
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `Hi,

We're thrilled to inform you that a speaker has confirmed their participation to speak at **%eventName%** event!

- Confirmed proposal: **%proposalTitle%**

Best regards.
`;
