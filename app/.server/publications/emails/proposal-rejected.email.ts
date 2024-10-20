import type { Event, Proposal, User } from '@prisma/client';
import { sendEmail } from '~/.server/shared/jobs/send-email.job';

import { Template } from '~/libs/email-template/template.ts';

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

const TEMPLATE = `Hi,

Thank you for your interest in presenting at **%eventName%** and for submitting your proposal titled **%proposalTitle%**.

After careful consideration and review by our selection committee, we regret to inform you that your proposal was not selected.

While your proposal wasn't selected this time, we sincerely appreciate the time and effort you put into crafting and submitting it.

We hope you'll consider submitting proposals for future events. We thank you for your interest in being part of %eventName%.

Best regards,

%eventName%.
`;
