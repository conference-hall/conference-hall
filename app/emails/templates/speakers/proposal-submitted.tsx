import { Button, Heading, Section, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { buildSpeakerProfileUrl } from '~/emails/utils/urls.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type EmailData = {
  event: { name: string; logoUrl: string | null };
  proposal: { title: string; speakers: Array<{ email: string }> };
};

export function sendProposalSubmittedEmailToSpeakers(data: EmailData) {
  return sendEmail.trigger({
    template: 'speakers/proposal-submitted',
    subject: `[${data.event.name}] Submission confirmed`,
    from: `${data.event.name} <no-reply@conference-hall.io>`,
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
  });
}

export default function ProposalSubmittedEmail({ event, proposal }: EmailData) {
  return (
    <BaseEventEmail logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>Thank you for your proposal!</Heading>

      <Text>
        We've successfully received <strong>{proposal.title}</strong> for <strong>{event.name}</strong>.
      </Text>

      <Text>To help organizers with the selection process, please complete your speaker profile.</Text>

      <Section className="text-center my-[32px]">
        <Button href={buildSpeakerProfileUrl()} className={styles.button}>
          Complete your speaker profile
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalSubmittedEmail.PreviewProps = {
  event: { name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: { title: 'My awesome proposal', speakers: [{ email: 'john@email.com' }] },
};
