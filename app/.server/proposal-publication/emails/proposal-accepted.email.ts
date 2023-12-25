import type { Event, Proposal, User } from '@prisma/client';
import { EmailQueue } from 'jobs/email/email.queue';

import { Template } from '~/libs/emails/template/template';
import { appUrl } from '~/libs/env/env.server';

type Variables = {
  eventSlug: string;
  eventName: string;
  proposalId: string;
  proposalTitle: string;
  appUrl: string;
};

export class ProposalAcceptedEmail {
  static async send(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    await Promise.all(
      proposals.map(async (proposal) => {
        const template = new Template<Variables>({
          subject: `[${event.name}] Congrats! Your proposal has been accepted`,
          content: TEMPLATE,
          variables: {
            eventSlug: event.slug,
            eventName: event.name,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            appUrl: appUrl(),
          },
        });

        await EmailQueue.get().enqueue('proposal-accepted-email', {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
          subject: template.renderSubject(),
          html: template.renderHtmlContent(),
        });
      }),
    );
  }
}

const TEMPLATE = `Hi,

We're thrilled to inform you that your proposal titled **%proposalTitle%** has been accepted for **%eventName%**! Congratulations!

Your contribution stood out among the numerous exceptional submissions, and we're excited to have you as a potential speaker.

Here are the details of your accepted talk:
- Event: **%eventName%**
- Talk Title: **%proposalTitle%**

To confirm or decline your participation as a speaker for this event, [**please click on the following link**](%appUrl%/%eventSlug%/proposals/%proposalId%).

Your presence and insights will undoubtedly enrich our event. However, if, for any reason, you're unable to participate, kindly use the same link to decline the invitation at your earliest convenience.

We look forward to your confirmation and eagerly anticipate your presentation at **%eventName%**!

Warm regards,

%eventName% team.
`;
