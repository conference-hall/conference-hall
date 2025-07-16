import { Button, Heading, Section, Text } from '@react-email/components';
import type { CustomEmailData, LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { EmailMarkdown } from '~/shared/emails/utils/email-markdown.tsx';
import { buildSpeakerProfileUrl } from '~/shared/emails/utils/urls.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

export type TemplateData = {
  event: { id: string; name: string; logoUrl: string | null };
  proposal: { title: string; speakers: Array<{ email: string; locale: string }> };
};

type EmailProps = TemplateData & LocaleEmailData & CustomEmailData;

export default function ProposalSubmittedEmail({ event, proposal, locale, customization, preview }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>{t('speakers.proposal-submitted.body.title')}</Heading>

      {customization?.content ? (
        <EmailMarkdown>{customization.content.replaceAll('{{proposal}}', proposal.title)}</EmailMarkdown>
      ) : (
        <>
          <Text>
            {t('speakers.proposal-submitted.body.text1', {
              proposal: proposal.title,
              event: event.name,
              interpolation: { escapeValue: false },
            })}
          </Text>

          <Text>{t('speakers.proposal-submitted.body.text2')}</Text>
        </>
      )}

      <Section className="text-center my-[32px]">
        <Button href={!preview ? buildSpeakerProfileUrl() : '#'} className={styles.button}>
          {t('speakers.proposal-submitted.body.cta')}
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalSubmittedEmail.buildPayload = (data: TemplateData, localeOverride?: string): EmailPayload => {
  const locale = localeOverride || data.proposal.speakers[0]?.locale || 'en';
  const t = getEmailI18n(locale);

  return {
    template: 'speakers-proposal-submitted',
    subject: t('speakers.proposal-submitted.subject', {
      event: data.event.name,
      interpolation: { escapeValue: false },
    }),
    from: t('common.email.from.event', { event: data.event.name, interpolation: { escapeValue: false } }),
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
    locale,
    customEventId: data.event.id,
  };
};

ProposalSubmittedEmail.PreviewProps = {
  event: { name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: { title: 'My awesome proposal', speakers: [{ email: 'john@email.com', locale: 'en' }] },
} as EmailProps;
