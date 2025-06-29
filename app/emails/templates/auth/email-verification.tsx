import { Button, Heading, Section, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/emails/email.types.ts';
import type { EmailPayload } from '~/emails/send-email.job.ts';
import { getEmailI18n } from '~/libs/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = { emailVerificationUrl: string };

type EmailProps = TemplateData & LocaleEmailData;

export default function VerificationEmail({ emailVerificationUrl, locale }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale}>
      <Heading className={styles.h1}>{t('auth.email-verification.body.title')}</Heading>

      <Text>{t('auth.email-verification.body.greeting')}</Text>
      <Text>{t('auth.email-verification.body.text1')}</Text>

      <Section className="text-center my-[32px]">
        <Button href={emailVerificationUrl} className={styles.button}>
          {t('auth.email-verification.body.cta')}
        </Button>
      </Section>

      <Text>{t('auth.email-verification.body.text2')}</Text>
      <Text>{t('auth.email-verification.body.signature')}</Text>
      <Text>{t('common.email.signature')}</Text>
    </BaseEventEmail>
  );
}

VerificationEmail.buildPayload = (email: string, locale: string, data: TemplateData): EmailPayload => {
  const t = getEmailI18n(locale);

  return {
    template: 'auth-email-verification',
    subject: t('auth.email-verification.subject'),
    from: t('common.email.from.default'),
    to: [email],
    data,
    locale,
  };
};

VerificationEmail.PreviewProps = {
  emailVerificationUrl: 'http://localhost:3000/auth/email-verification',
  locale: 'en',
} as EmailProps;
