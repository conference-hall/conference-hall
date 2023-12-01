import type { Event, Proposal, User } from '@prisma/client';

import { config } from '~/libs/config';
import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type EmailVariables = {
  eventSlug: string;
  eventName: string;
  proposalId: string;
  proposalTitle: string;
  appUrl: string;
};

export class ProposalAcceptedEmail extends Template {
  static async send(event: Event, proposals: Array<Proposal & { speakers: User[] }>) {
    const template = new ProposalAcceptedEmail(`[${event.name}] Your talk has been accepted`, TEMPLATE);

    const recipients = proposals.map((proposal) => ({
      to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
      variables: {
        eventSlug: event.slug,
        eventName: event.name,
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        appUrl: config.appUrl,
      },
    }));

    await emailProvider.send<EmailVariables>(`${event.name} <no-reply@conference-hall.io>`, recipients, template);
  }
}

const TEMPLATE = `Hi,

Your talk **%proposalTitle%** at **%eventName%** has been accepted.

In order to help organizers for the selection and the event management, you can confirm or decline your participation to %eventName%.

[**Please confirm or decline.**](%appUrl%/%eventSlug%/proposals/%proposalId%)

See you there!

%eventName% team.
`;
