import type { Event, Proposal } from '@prisma/client';
import { sendEmail } from '~/.server/shared/jobs/send-email.job';

import { Template } from '~/libs/email-template/template.ts';
import type { EventEmailNotificationsKeys } from '~/types/events.types.ts';

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

    await sendEmail.trigger({
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: [event.emailOrganizer],
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `Hi,

We're excited to inform you that a new proposal has been applied at **%eventName%**.

- Proposal submitted: **%proposalTitle%**

Please take a moment to review the proposal when you get a chance.

Best regards.
`;
