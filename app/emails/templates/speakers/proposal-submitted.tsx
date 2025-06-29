import { Button, Heading, Section, Text } from '@react-email/components';
import type { CustomEmailData, LocaleEmailData } from '~/emails/email.types.ts';
import type { EmailPayload } from '~/emails/send-email.job.ts';
import { EmailMarkdown } from '~/emails/utils/email-mardown.tsx';
import { buildSpeakerProfileUrl } from '~/emails/utils/urls.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = {
  event: { id: string; name: string; logoUrl: string | null };
  proposal: { title: string; speakers: Array<{ email: string; locale: string }> };
};

type EmailProps = TemplateData & LocaleEmailData & CustomEmailData;

export default function ProposalSubmittedEmail({ event, proposal, locale, customization, preview }: EmailProps) {
  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>Thank you for your proposal!</Heading>

      {customization?.content ? (
        <EmailMarkdown>{customization.content}</EmailMarkdown>
      ) : (
        <>
          <Text>
            We've successfully received <strong>{proposal.title}</strong> for <strong>{event.name}</strong>.
          </Text>

          <Text>To help organizers with the selection process, please complete your speaker profile.</Text>
        </>
      )}

      <Section className="text-center my-[32px]">
        <Button href={!preview ? buildSpeakerProfileUrl() : '#'} className={styles.button}>
          Complete your speaker profile
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalSubmittedEmail.buildPayload = (data: TemplateData): EmailPayload => {
  const locale = data.proposal.speakers[0]?.locale ?? 'en';
  return {
    template: 'speakers/proposal-submitted',
    subject: `[${data.event.name}] Submission confirmed`,
    from: `${data.event.name} <no-reply@mg.conference-hall.io>`,
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
    locale,
    customization: { eventId: data.event.id, template: 'proposal-submitted' },
  };
};

ProposalSubmittedEmail.PreviewProps = {
  event: { name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: { title: 'My awesome proposal', speakers: [{ email: 'john@email.com', locale: 'en' }] },
} as EmailProps;
