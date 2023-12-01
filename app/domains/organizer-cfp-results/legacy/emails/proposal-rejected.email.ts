import type { Event, Proposal, User } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type EmailVariables = {
  eventName: string;
  proposalTitle: string;
};

export class ProposalRejectedEmail extends Template {
  static async send(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    const template = new ProposalRejectedEmail(`[${event.name}] Your talk has been declined`, TEMPLATE);

    const recipients = proposals.map((proposal) => ({
      to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    }));

    await emailProvider.send<EmailVariables>(`${event.name} <no-reply@conference-hall.io>`, recipients, template);
  }
}

const TEMPLATE = `Hi,

Your talk **%proposalTitle%** at **%eventName%** has been declined.

We had lots of excellent talks this year and choosing among them has been heart-breaking. 😓 

Thank you very much for your submission and please consider submitting again next year.

%eventName% team.
`;
