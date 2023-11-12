type CampaignTemplate = Array<{
  name: string;
  title: string;
  description: string;
  segments: Array<{ status: string }>;
  email_from: string;
  email_subject: string;
  email_template: string;
}>;

export const campaignTemplates: CampaignTemplate = [
  {
    name: 'accepted-proposals',
    title: 'Accepted proposals emails',
    description: 'Send an email to speakers to confirm or declined their presence to the conference.',
    segments: [{ status: 'ACCEPTED' }],
    email_from: `[%eventName%] <no-reply@conference-hall.io>`,
    email_subject: `[%eventName%] Your talk has been accepted`,
    email_template: `Hi %recipient.fullname%,

Your talk **%recipient.proposalTitle%** at **%eventName%** has been accepted.

In order to help organizers for the selection and the event management, you can confirm or decline your participation to %eventName%.

[**Please confirm or decline.**](%appUrl%/%eventSlug%/proposals/%recipient.proposalId%)

See you there!

%eventName% team.
    `,
  },
  {
    name: 'rejected-proposals',
    title: 'Rejected proposals emails',
    description: 'Send an email to speakers for rejected proposals.',
    segments: [{ status: 'REJECTED' }],
    email_from: `[%eventName%] <no-reply@conference-hall.io>`,
    email_subject: '[%eventName%] Your talk has been declined',
    email_template: `Dear %recipient.fullname%,

Your talk **%recipient.proposalTitle%** at **%eventName%** has been declined.

We had lots of excellent talks this year and choosing among them has been heart-breaking. 😓 

Thank you very much for your submission and please consider submitting again next year.

%eventName% team.
    `,
  },
];
