import type { Event, Proposal, User } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type Variables = {
  eventName: string;
  proposalTitle: string;
};

export class ProposalRejectedEmail {
  static async send(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    await Promise.all(
      proposals.map(async (proposal) => {
        const template = new Template<Variables>({
          subject: `[${event.name}] Your talk has been declined`,
          content: TEMPLATE,
          variables: {
            eventName: event.name,
            proposalTitle: proposal.title,
          },
        });

        await emailProvider.send({
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

Your talk **%proposalTitle%** at **%eventName%** has been declined.

We had lots of excellent talks this year and choosing among them has been heart-breaking. 😓 

Thank you very much for your submission and please consider submitting again next year.

%eventName% team.
`;
