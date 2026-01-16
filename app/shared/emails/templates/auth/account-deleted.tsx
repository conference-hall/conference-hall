import { Heading, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { formatDate } from '~/shared/datetimes/datetimes.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = { deletionDate: string };

type EmailProps = TemplateData & LocaleEmailData;

export default function AccountDeletedEmail({ deletionDate, locale }: EmailProps) {
  const t = getEmailI18n(locale);
  const formattedDate = formatDate(new Date(deletionDate), { format: 'long', locale });

  return (
    <BaseEventEmail locale={locale}>
      <Heading className={styles.h1}>{t('auth.account-deleted.body.title')}</Heading>

      <Text>{t('auth.account-deleted.body.text1', { date: formattedDate })}</Text>
      <Text>{t('auth.account-deleted.body.text2')}</Text>

      <Text>{t('auth.account-deleted.body.signature')}</Text>
      <Text>{t('common.email.signature')}</Text>
    </BaseEventEmail>
  );
}

AccountDeletedEmail.buildPayload = (email: string, locale: string, data: TemplateData): EmailPayload => {
  const t = getEmailI18n(locale);

  return {
    template: 'auth-account-deleted',
    subject: t('auth.account-deleted.subject'),
    from: t('common.email.from.default'),
    to: [email],
    data,
    locale,
  };
};

AccountDeletedEmail.PreviewProps = {
  deletionDate: '2025-11-11',
  locale: 'en',
} as EmailProps;
