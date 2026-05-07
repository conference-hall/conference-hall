import { Button, Heading, Section, Text } from 'react-email';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import { getSharedServerEnv } from '../../../../../servers/environment.server.ts';
import BaseEmail, { styles } from '../base.email.tsx';

type TemplateData = { eventName: string; token: string };

type EmailProps = TemplateData & LocaleEmailData;

export default function WelcomeOrganizerEmail({ eventName, token, locale }: EmailProps) {
  const t = getEmailI18n(locale);
  const { APP_URL } = getSharedServerEnv();
  const teamCreationUrl = `${APP_URL}/team/new?token=${token}`;

  return (
    <BaseEmail locale={locale}>
      <Heading className={styles.h1}>{t('organizers.welcome.body.title')}</Heading>

      <Text>{t('organizers.welcome.body.text1', { eventName })}</Text>
      <Text>{t('organizers.welcome.body.text2')}</Text>

      <Section className="my-8 text-center">
        <Button href={teamCreationUrl} className={styles.button}>
          {t('organizers.welcome.body.cta')}
        </Button>
      </Section>

      <Text className="text-xs text-gray-500">{t('organizers.welcome.body.note')}</Text>

      <Text>{t('common.email.signature')}</Text>
    </BaseEmail>
  );
}

WelcomeOrganizerEmail.buildPayload = (email: string, eventName: string, token: string): EmailPayload => {
  const t = getEmailI18n('en');
  return {
    template: 'organizers-welcome',
    subject: t('organizers.welcome.subject'),
    from: t('common.email.from.default'),
    to: [email],
    data: { eventName, token },
    locale: 'en',
  };
};

WelcomeOrganizerEmail.PreviewProps = {
  eventName: 'Awesome Conference',
  token: 'preview-token-123',
  locale: 'en',
} as EmailProps;
