import { Button, Heading, Section, Text } from '@react-email/components';
import type { CustomEmailData, LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { EmailMarkdown } from '~/shared/emails/utils/email-markdown.tsx';
import { buildSpeakerProposalUrl } from '~/shared/emails/utils/urls.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import BaseEventEmail from '../base-event.email.tsx';
import { styles } from '../base.email.tsx';

export type TemplateData = {
  event: { id: string; slug: string; name: string; logo: string | null };
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
    <BaseEventEmail locale={locale} logoUrl={resolveStorageUrl(event.logo)}>
      <Heading className={styles.h1}>{t('speakers.proposal-accepted.body.title')}</Heading>

      {customization?.content ? (
        <EmailMarkdown variables={{ proposal: proposal.title }}>{customization.content}</EmailMarkdown>
      ) : (
        <Text>
          {t('speakers.proposal-accepted.body.text1', { event: event.name, interpolation: { escapeValue: false } })}
        </Text>
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

      <Section className="my-8 text-center">
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
    subject: t('speakers.proposal-accepted.subject', { event: data.event.name, interpolation: { escapeValue: false } }),
    from: t('common.email.from.event', { event: data.event.name, interpolation: { escapeValue: false } }),
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
    locale,
    customEventId: data.event.id,
  };
};

ProposalAcceptedEmail.PreviewProps = {
  event: { slug: 'awesome-event', name: 'Awesome event', logo: 'seed/123/128.png' },
  proposal: {
    id: '123',
    title: 'My awesome proposal',
    formats: [{ name: 'Quickie' }],
    speakers: [{ email: 'john@email.com', locale: 'en' }],
  },
} as EmailProps;
