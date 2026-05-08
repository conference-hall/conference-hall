import { Heading, Text } from 'react-email';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import BaseEmail, { styles } from '../base.email.tsx';

type TemplateData = { eventName: string; email: string };

type EmailProps = TemplateData & LocaleEmailData;

export default function NewTeamRequestEmail({ eventName, email, locale }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEmail locale={locale}>
      <Heading className={styles.h1}>{t('admin.new-team-request.body.title')}</Heading>

      <Text>{t('admin.new-team-request.body.text1', { email, eventName })}</Text>
      <Text>{t('admin.new-team-request.body.text2')}</Text>

      <Text>{t('common.email.signature')}</Text>
    </BaseEmail>
  );
}

NewTeamRequestEmail.buildPayload = (adminEmail: string, data: TemplateData): EmailPayload => {
  const t = getEmailI18n('en');

  return {
    template: 'admin-new-team-request',
    subject: t('admin.new-team-request.subject'),
    from: t('common.email.from.default'),
    to: [adminEmail],
    data,
    locale: 'en',
  };
};

NewTeamRequestEmail.PreviewProps = {
  eventName: 'DevFest Nantes',
  email: 'speaker@example.com',
  locale: 'en',
} as EmailProps;
