import type { Event, EventFormat, Proposal, User } from '@prisma/client';
import { sendEmail } from 'jobs/send-email.job.ts';

import { Template } from '~/libs/email-template/template.ts';
import { appUrl } from '~/libs/env/env.server.ts';

type Variables = {
  eventSlug: string;
  eventName: string;
  proposalId: string;
  proposalTitle: string;
  formats: string;
  appUrl: string;
};

export class ProposalAcceptedEmail {
  static async send(event: Event, proposals: Array<Proposal & { speakers: User[]; formats: EventFormat[] }>) {
    await Promise.all(
      proposals.map(async (proposal) => {
        const template = new Template<Variables>({
          subject: `[${event.name}] Congrats! Your proposal has been accepted`,
          content: getTemplate(proposal.formats.length > 0),
          variables: {
            eventSlug: event.slug,
            eventName: event.name,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            formats: proposal.formats.map((f) => f.name).join(', '),
            appUrl: appUrl(),
          },
        });

        await sendEmail.trigger({
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
          subject: template.renderSubject(),
          html: template.renderHtmlContent(),
        });
      }),
    );
  }
}

const getTemplate = (hasFormats: boolean) => `Hi,

We're thrilled to inform you that your proposal titled **%proposalTitle%** has been accepted for **%eventName%**! Congratulations!

Here are the details of your accepted talk:
- Event: **%eventName%**
- Talk Title: **%proposalTitle%**
${hasFormats ? '- Formats: **%formats%**' : ''}

To confirm or decline your participation as a speaker for this event, [**please click on the following link**](%appUrl%/%eventSlug%/proposals/%proposalId%).

Your presence and insights will undoubtedly enrich our event. However, if, for any reason, you're unable to participate, kindly use the same link to decline the invitation at your earliest convenience.

We look forward to your confirmation and eagerly anticipate your presentation at **%eventName%**!

Best regards,

%eventName%.
`;
