import { Button, Heading, Section, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { buildSpeakerProposalUrl } from '~/emails/utils/urls.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = {
  event: { slug: string; name: string; logoUrl: string | null };
  proposal: {
    id: string;
    title: string;
    formats: Array<{ name: string }>;
    speakers: Array<{ email: string; locale: string }>;
  };
};

export function sendProposalAcceptedEmailToSpeakers(data: TemplateData) {
  const locale = data.proposal.speakers[0]?.locale ?? 'en';

  return sendEmail.trigger({
    template: 'speakers/proposal-accepted',
    subject: `[${data.event.name}] Congrats! Your proposal has been accepted`,
    from: `${data.event.name} <no-reply@mg.conference-hall.io>`,
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
    locale,
  });
}

type EmailProps = TemplateData & { locale: string };

/** @public */
export default function ProposalAcceptedEmail({ event, proposal, locale }: EmailProps) {
  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>Proposal accepted!</Heading>

      <Text>
        We're thrilled to inform you that your proposal has been accepted for <strong>{event.name}!</strong>
      </Text>

      <Section className={styles.card}>
        <Text>
          <strong>{proposal.title}</strong>
          <br />
          {proposal.formats.length > 0
            ? `Format(s): ${proposal.formats.map((format) => format.name).join(', ')}`
            : null}
        </Text>
      </Section>

      <Section className="text-center my-[32px]">
        <Button href={buildSpeakerProposalUrl(event.slug, proposal.id)} className={styles.button}>
          Confirm or decline your participation
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalAcceptedEmail.PreviewProps = {
  event: { slug: 'awesome-event', name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: {
    id: '123',
    title: 'My awesome proposal',
    formats: [{ name: 'Talk' }],
    speakers: [{ email: 'john@email.com', locale: 'en' }],
  },
} as EmailProps;
