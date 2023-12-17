import type { Event, Proposal, User } from '@prisma/client';
import { EmailQueue } from 'jobs/email/email.queue';

import { Template } from '~/libs/emails/template/template';

type Variables = { eventName: string; proposalTitle: string };

export class ProposalSubmittedEmail {
  static async send(event: Event, proposal: Proposal & { speakers: User[] }) {
    const template = new Template<Variables>({
      subject: `[${event.name}] Submission confirmed`,
      content: TEMPLATE,
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
      },
    });

    await EmailQueue.get().enqueue('proposal-submitted-email', {
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `
Hi,

Your talk **%proposalTitle%** has been successfully submitted to %eventName%.

In order to help organizers select and manage the event, please don't forget to fill your profile.

You will soon be informed if your talk has been selected or not.

Thanks!
`;
