import { Button, Heading, Section, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type EmailData = { email: string; passwordResetUrl: string };

export function sendResetPasswordEmail(data: EmailData) {
  return sendEmail.trigger({
    template: 'auth/reset-password',
    subject: 'Reset your password for Conference Hall',
    from: 'Conference Hall <no-reply@mg.conference-hall.io>',
    to: [data.email],
    data,
  });
}

export default function ResetPasswordEmail({ passwordResetUrl }: EmailData) {
  return (
    <BaseEventEmail>
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
      <Text>Your Conference Hall team</Text>
    </BaseEventEmail>
  );
}

ResetPasswordEmail.PreviewProps = {
  email: 'bob@example.com',
  passwordResetUrl: 'http://localhost:3000/auth/reset-password',
};
