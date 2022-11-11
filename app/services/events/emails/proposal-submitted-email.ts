import type { Event, Proposal, User } from '@prisma/client';
import { SingleEmail } from '~/services/emails/single-email';

type ProposalSubmittedEmailVariables = { fullName: string; proposalTitle: string };

export class ProposalSubmittedEmail extends SingleEmail<ProposalSubmittedEmailVariables> {
  constructor(event: Event) {
    super({
      event,
      from: `${event.name} <no-reply@conference-hall.io>`,
      subject: `[${event.name}] Submission confirmed`,
      template: TEMPLATE,
    });
  }

  static send(event: Event, proposal: Proposal & { speakers: User[] }) {
    const email = new ProposalSubmittedEmail(event);

    proposal.speakers.forEach((speaker) => {
      if (!speaker.email || !speaker.name) return;
      email.addRecipient(speaker.email, { fullName: speaker.name, proposalTitle: proposal.title });
    });
    return email.send();
  }
}

const TEMPLATE = `
Hi %recipient.fullname%,

Your talk **%recipient.proposalTitle%** has been successfully submitted.

In order to help organizers select and manage the event, please don't forget to fill your profile.

You will soon be informed if your talk has been selected or not.

Thanks!
`;
