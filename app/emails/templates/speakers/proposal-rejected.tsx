import { Heading, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type EmailData = {
  event: { name: string; logoUrl: string | null };
  proposal: { title: string; speakers: Array<{ email: string }> };
};

export function sendProposalRejectedEmailToSpeakers(data: EmailData) {
  return sendEmail.trigger({
    template: 'speakers/proposal-rejected',
    subject: `[${data.event.name}] Your proposal has been declined`,
    from: `${data.event.name} <no-reply@conference-hall.io>`,
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
  });
}

export default function ProposalRejectedEmail({ event, proposal }: EmailData) {
  return (
    <BaseEventEmail logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>Proposal declined.</Heading>

      <Text>
        Thank you for your interest in presenting at <strong>{event.name}</strong> and for submitting your proposal
        titled <strong>{proposal.title}</strong>.
      </Text>

      <Text>
        After careful consideration and review by our selection committee, we regret to inform you that your proposal
        was not selected.
      </Text>

      <Text>
        While your proposal wasn't selected this time, we sincerely appreciate the time and effort you put into crafting
        and submitting it.
      </Text>

      <Text>
        We hope you'll consider submitting proposals for future events. We thank you for your interest in being part of{' '}
        <strong>{event.name}</strong>.
      </Text>
    </BaseEventEmail>
  );
}

ProposalRejectedEmail.PreviewProps = {
  event: { name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: { title: 'My awesome proposal', speakers: [{ email: 'john@email.com' }] },
};
