import { Button, Heading, Section, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type EmailData = { email: string; emailVerificationUrl: string };

export function sendVerificationEmail(data: EmailData) {
  return sendEmail.trigger({
    template: 'auth/email-verification',
    subject: 'Verify your email address for Conference Hall',
    from: 'Conference Hall <no-reply@mg.conference-hall.io>',
    to: [data.email],
    data,
  });
}

export default function VerificationEmail({ emailVerificationUrl }: EmailData) {
  return (
    <BaseEventEmail>
      <Heading className={styles.h1}>Welcome to Conference Hall</Heading>

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
  email: 'bob@example.com',
  emailVerificationUrl: 'http://localhost:3000/auth/email-verification',
};
