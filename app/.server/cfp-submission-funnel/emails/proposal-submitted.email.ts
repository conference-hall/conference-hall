import type { Event, Proposal, User } from '@prisma/client';
import { sendEmail } from 'jobs/send-email.job.ts';

import { Template } from '~/libs/email-template/template.ts';
import { appUrl } from '~/libs/env/env.server.ts';

type Variables = { eventName: string; proposalTitle: string; appUrl: string };

export class ProposalSubmittedEmail {
  static async send(event: Event, proposal: Proposal & { speakers: User[] }) {
    const template = new Template<Variables>({
      subject: `[${event.name}] Submission confirmed`,
      content: TEMPLATE,
      variables: {
        eventName: event.name,
        proposalTitle: proposal.title,
        appUrl: appUrl(),
      },
    });

    await sendEmail.trigger({
      from: `${event.name} <no-reply@conference-hall.io>`,
      to: proposal.speakers.map((speaker) => speaker.email).filter(Boolean),
      subject: template.renderSubject(),
      html: template.renderHtmlContent(),
    });
  }
}

const TEMPLATE = `Hi,

Thank you for submitting your proposal **%proposalTitle%** for **%eventName%**! We've received your proposal successfully.

To ensure that your proposal gets the attention it deserves and to assist organizers in making informed decisions, we kindly ask you to complete [your speaker profile](%appUrl%/speaker/profile). A detailed profile greatly helps us in managing and selecting proposals effectively.

We're diligently reviewing all submissions, and we'll notify you soon regarding the status of your proposal. Your patience is greatly appreciated.

Thank you for your participation in **%eventName%**!

Best regards,

%eventName%.
`;
