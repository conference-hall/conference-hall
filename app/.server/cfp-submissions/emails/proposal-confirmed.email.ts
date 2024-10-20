import type { Event, Proposal } from '@prisma/client';
import { sendEmail } from '~/.server/shared/jobs/send-email.job';

import { Template } from '~/libs/email-template/template.ts';
import type { EventEmailNotificationsKeys } from '~/types/events.types.ts';

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

    await sendEmail.trigger({
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
