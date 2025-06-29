import { Button, Heading, Section, Text } from '@react-email/components';
import type { CustomEmailData, LocaleEmailData } from '~/emails/email.types.ts';
import type { EmailPayload } from '~/emails/send-email.job.ts';
import { EmailMarkdown } from '~/emails/utils/email-markdown.tsx';
import { buildSpeakerProposalUrl } from '~/emails/utils/urls.ts';
import { getEmailI18n } from '~/libs/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = {
  event: { id: string; slug: string; name: string; logoUrl: string | null };
  proposal: {
    id: string;
    title: string;
    formats: Array<{ name: string }>;
    speakers: Array<{ email: string; locale: string }>;
  };
};

type EmailProps = TemplateData & LocaleEmailData & CustomEmailData;

export default function ProposalAcceptedEmail({ event, proposal, locale, customization, preview }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>{t('speakers.proposal-accepted.body.title')}</Heading>

      {customization?.content ? (
        <EmailMarkdown>{customization.content.replaceAll('{{proposal}}', proposal.title)}</EmailMarkdown>
      ) : (
        <Text>{t('speakers.proposal-accepted.body.text1', { event: event.name })}</Text>
      )}

      <Section className={styles.card}>
        <Text>
          <strong>{proposal.title}</strong>
          <br />
          {proposal.formats.length > 0
            ? t('speakers.proposal-accepted.body.formats', {
                formats: proposal.formats.map((f) => f.name),
                interpolation: { escapeValue: false },
              })
            : null}
        </Text>
      </Section>

      <Section className="text-center my-[32px]">
        <Button href={!preview ? buildSpeakerProposalUrl(event.slug, proposal.id) : '#'} className={styles.button}>
          {t('speakers.proposal-accepted.body.cta')}
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalAcceptedEmail.buildPayload = (data: TemplateData, localeOverride?: string): EmailPayload => {
  const locale = localeOverride || data.proposal.speakers[0]?.locale || 'en';
  const t = getEmailI18n(locale);

  return {
    template: 'speakers-proposal-accepted',
    subject: t('speakers.proposal-accepted.subject', { event: data.event.name }),
    from: t('common.email.from.event', { event: data.event.name }),
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
    locale,
    customEventId: data.event.id,
  };
};

ProposalAcceptedEmail.PreviewProps = {
  event: { slug: 'awesome-event', name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: {
    id: '123',
    title: 'My awesome proposal',
    formats: [{ name: 'Quickie' }],
    speakers: [{ email: 'john@email.com', locale: 'en' }],
  },
} as EmailProps;
