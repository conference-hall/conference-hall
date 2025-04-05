import { Button, Heading, Section, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = { passwordResetUrl: string };

export function sendResetPasswordEmail(email: string, locale: string, data: TemplateData) {
  return sendEmail.trigger({
    template: 'auth/reset-password',
    subject: 'Reset your password for Conference Hall',
    from: 'Conference Hall <no-reply@mg.conference-hall.io>',
    to: [email],
    data,
    locale,
  });
}

type EmailProps = TemplateData & { locale: string };

export default function ResetPasswordEmail({ passwordResetUrl, locale }: EmailProps) {
  return (
    <BaseEventEmail locale={locale}>
      <Heading className={styles.h1}>Reset your password</Heading>

      <Text>Hello,</Text>
      <Text>Click on the button to reset your Conference Hall password for your account.</Text>

      <Section className="text-center my-[32px]">
        <Button href={passwordResetUrl} className={styles.button}>
          Reset your password
        </Button>
      </Section>

      <Text>If you didn’t ask to reset your password, you can ignore this email.</Text>
      <Text>Thanks,</Text>
      <Text>Conference Hall team</Text>
    </BaseEventEmail>
  );
}

ResetPasswordEmail.PreviewProps = {
  passwordResetUrl: 'http://localhost:3000/auth/reset-password',
  locale: 'en',
} as EmailProps;
