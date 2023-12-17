import type { Event, Proposal, User } from '@prisma/client';
import { EmailQueue } from 'jobs/email/email.queue';

import { config } from '~/libs/config.server';
import { Template } from '~/libs/emails/template/template';

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
          subject: `[${event.name}] Your talk has been accepted`,
          content: TEMPLATE,
          variables: {
            eventSlug: event.slug,
            eventName: event.name,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            appUrl: config.appUrl,
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

Your talk **%proposalTitle%** at **%eventName%** has been accepted.

In order to help organizers for the selection and the event management, you can confirm or decline your participation to %eventName%.

[**Please confirm or decline.**](%appUrl%/%eventSlug%/proposals/%proposalId%)

See you there!

%eventName% team.
`;
