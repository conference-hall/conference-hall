import { Heading, Text } from '@react-email/components';
import { getEmailI18n } from '~/libs/i18n/i18n.emails.ts';
import type { CustomEmailData, LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { EmailMarkdown } from '~/shared/emails/utils/email-markdown.tsx';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = {
  event: { id: string; name: string; logoUrl: string | null };
  proposal: { title: string; speakers: Array<{ email: string; locale: string }> };
};

type EmailProps = TemplateData & LocaleEmailData & CustomEmailData;

export default function ProposalRejectedEmail({ event, proposal, locale, customization }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>{t('speakers.proposal-rejected.body.title')}</Heading>

      {customization?.content ? (
        <EmailMarkdown>{customization.content.replaceAll('{{proposal}}', proposal.title)}</EmailMarkdown>
      ) : (
        <>
          <Text>{t('speakers.proposal-rejected.body.text1', { event: event.name, proposal: proposal.title })}</Text>

          <Text>{t('speakers.proposal-rejected.body.text2')}</Text>

          <Text>{t('speakers.proposal-rejected.body.text3')}</Text>

          <Text>{t('speakers.proposal-rejected.body.text4')}</Text>
        </>
      )}
    </BaseEventEmail>
  );
}

ProposalRejectedEmail.buildPayload = (data: TemplateData, localeOverride?: string): EmailPayload => {
  const locale = localeOverride || data.proposal.speakers[0]?.locale || 'en';
  const t = getEmailI18n(locale);

  return {
    template: 'speakers-proposal-rejected',
    subject: t('speakers.proposal-rejected.subject', { event: data.event.name }),
    from: t('common.email.from.event', { event: data.event.name }),
    to: data.proposal.speakers.map((speaker) => speaker.email),
    data,
    locale,
    customEventId: data.event.id,
  };
};

ProposalRejectedEmail.PreviewProps = {
  event: { name: 'Awesome event', logoUrl: 'https://picsum.photos/seed/123/128' },
  proposal: { title: 'My awesome proposal', speakers: [{ email: 'john@email.com', locale: 'en' }] },
} as EmailProps;
