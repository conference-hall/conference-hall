import type { Event, Proposal, User } from '@prisma/client';

import { emailProvider } from '~/libs/emails/provider';
import { Template } from '~/libs/emails/template/template';

type EmailVariables = { eventName: string; proposalTitle: string };

export class ProposalSubmittedEmail extends Template {
  static async send(event: Event, proposal: Proposal & { speakers: User[] }) {
    const template = new ProposalSubmittedEmail(`[${event.name}] Submission confirmed`, TEMPLATE);

    const recipients = {
      to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    };

    await emailProvider.send<EmailVariables>(`${event.name} <no-reply@conference-hall.io>`, [recipients], template);
  }
}

const TEMPLATE = `
Hi,

Your talk **%proposalTitle%** has been successfully submitted to %eventName%.

In order to help organizers select and manage the event, please don't forget to fill your profile.

You will soon be informed if your talk has been selected or not.

Thanks!
`;
