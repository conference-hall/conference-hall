import type { Event, Prisma, Proposal } from '@prisma/client';
import { EmailQueue } from 'jobs/email/email.queue';

import { Template } from '~/libs/emails/template/template';
import { EventEmailNotificationsKeys } from '~/types/notifications.types';

type Variables = { eventName: string; proposalTitle: string };

export class ProposalReceivedEmail {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications || []) as EventEmailNotificationsKeys;
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

    await EmailQueue.get().enqueue('proposal-received-email', {
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: [event.emailOrganizer],
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `Hi,

We're excited to inform you that a new proposal has been submitted for consideration at **%eventName%**.

- Proposal submitted: **%proposalTitle%**

Please take a moment to review the proposal when you get a chance.

Best regards.
`;
