import { Button, Heading, Section, Text } from 'react-email';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import BaseEmail, { styles } from '../base.email.tsx';

type TemplateData = { eventName: string; activateUrl: string };

type EmailProps = TemplateData & LocaleEmailData;

export default function TeamAccessApprovedEmail({ eventName, activateUrl, locale }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEmail locale={locale}>
      <Heading className={styles.h1}>{t('organizers.team-access-approved.body.title')}</Heading>

      <Text>{t('organizers.team-access-approved.body.greeting')}</Text>
      <Text>{t('organizers.team-access-approved.body.text1', { eventName })}</Text>

      <Text>{t('organizers.team-access-approved.body.features-intro')}</Text>
      <ul style={{ paddingLeft: '20px', margin: '0 0 16px 0' }}>
        <li>{t('organizers.team-access-approved.body.feature1')}</li>
        <li>{t('organizers.team-access-approved.body.feature2')}</li>
        <li>{t('organizers.team-access-approved.body.feature3')}</li>
        <li>{t('organizers.team-access-approved.body.feature4')}</li>
      </ul>

      <Section className="my-8 text-center">
        <Button href={activateUrl} className={styles.button}>
          {t('organizers.team-access-approved.body.cta')}
        </Button>
      </Section>

      <Text>{t('organizers.team-access-approved.body.text2')}</Text>
      <Text>{t('common.email.signature')}</Text>
    </BaseEmail>
  );
}

TeamAccessApprovedEmail.buildPayload = (email: string, locale: string, data: TemplateData): EmailPayload => {
  const t = getEmailI18n(locale);

  return {
    template: 'organizers-team-access-approved',
    subject: t('organizers.team-access-approved.subject'),
    from: t('common.email.from.default'),
    to: [email],
    data,
    locale,
  };
};

TeamAccessApprovedEmail.PreviewProps = {
  eventName: 'DevFest Nantes',
  activateUrl: 'http://localhost:3000/team/activate?token=preview-token',
  locale: 'en',
} as EmailProps;
