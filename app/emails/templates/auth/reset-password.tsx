import { Button, Heading, Section, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/emails/email.types.ts';
import type { EmailPayload } from '~/emails/send-email.job.ts';
import { getEmailI18n } from '~/libs/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = { passwordResetUrl: string };

type EmailProps = TemplateData & LocaleEmailData;

export default function ResetPasswordEmail({ passwordResetUrl, locale }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale}>
      <Heading className={styles.h1}>{t('auth.reset-password.body.title')}</Heading>

      <Text>{t('auth.reset-password.body.greeting')}</Text>
      <Text>{t('auth.reset-password.body.text1')}</Text>

      <Section className="text-center my-[32px]">
        <Button href={passwordResetUrl} className={styles.button}>
          {t('auth.reset-password.body.cta')}
        </Button>
      </Section>

      <Text>{t('auth.reset-password.body.text2')}</Text>
      <Text>{t('auth.reset-password.body.signature')}</Text>
      <Text>{t('common.email.signature')}</Text>
    </BaseEventEmail>
  );
}

ResetPasswordEmail.buildPayload = (email: string, locale: string, data: TemplateData): EmailPayload => {
  const t = getEmailI18n(locale);

  return {
    template: 'auth/reset-password',
    subject: t('auth.reset-password.subject'),
    from: t('common.email.from.default'),
    to: [email],
    data,
    locale,
  };
};

ResetPasswordEmail.PreviewProps = {
  passwordResetUrl: 'http://localhost:3000/auth/reset-password',
  locale: 'en',
} as EmailProps;
