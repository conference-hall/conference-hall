import type { Event, Proposal } from '@prisma/client';
import { EmailQueue } from 'jobs/email/email.queue.ts';

import { Template } from '~/libs/email-template/template.ts';
import type { EventEmailNotificationsKeys } from '~/types/notifications.types';

type Variables = { eventName: string; proposalTitle: string };

export class ProposalDeclinedEmail {
  static async send(event: Event, proposal: Proposal) {
    const notifications = (event.emailNotifications || []) as EventEmailNotificationsKeys;
    if (!notifications.includes('declined')) return;
    if (!event.emailOrganizer) return;

    const template = new Template<Variables>({
      subject: `[${event.name}] Talk declined by speaker`,
      content: TEMPLATE,
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    });

    await EmailQueue.get().enqueue('proposal-declined-email', {
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: [event.emailOrganizer],
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `Hi,

We regret to inform you that a speaker has declined the invitation to speak at **%eventName%**.

- Declined proposal: **%proposalTitle%**

Best regards.
`;
