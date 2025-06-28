import { Button, Heading, Section, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/emails/email.types.ts';
import { sendEmail } from '~/emails/send-email.job.ts';
import { getEmailI18n } from '~/libs/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = { emailVerificationUrl: string };

export function sendVerificationEmail(email: string, locale: string, data: TemplateData) {
  return sendEmail.trigger({
    template: 'auth/email-verification',
    subject: 'Verify your email address for Conference Hall',
    from: 'Conference Hall <no-reply@mg.conference-hall.io>',
    to: [email],
    data,
    locale,
  });
}

type EmailProps = TemplateData & LocaleEmailData;

/** @public */
export default function VerificationEmail({ emailVerificationUrl, locale }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale}>
      <Heading className={styles.h1}>{t('emails.email-verification.title')}</Heading>

      <Text>Hello,</Text>
      <Text>Thanks for signing up to Conference Hall! Click on the button to verify your email address.</Text>

      <Section className="text-center my-[32px]">
        <Button href={emailVerificationUrl} className={styles.button}>
          Verify your email address
        </Button>
      </Section>

      <Text>If you didn’t sign up for Conference Hall, you can ignore this email.</Text>
      <Text>Thanks,</Text>
      <Text>Conference Hall team</Text>
    </BaseEventEmail>
  );
}

VerificationEmail.PreviewProps = {
  emailVerificationUrl: 'http://localhost:3000/auth/email-verification',
  locale: 'en',
} as EmailProps;
