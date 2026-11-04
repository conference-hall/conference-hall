import { Fragment } from 'react';
import { Button, Heading, Section, Text } from 'react-email';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import BaseEmail, { styles } from '../base.email.tsx';

type TemplateData = {
  eventName: string;
  teamName: string;
  organizerName: string;
  message: string | null;
  invitationUrl: string;
};

type EmailProps = TemplateData & LocaleEmailData;

export default function SpeakerInvitationEmail({
  eventName,
  teamName,
  organizerName,
  message,
  invitationUrl,
  locale,
}: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEmail locale={locale}>
      <Heading className={styles.h1}>
        {t('speakers.event-invitation.title', { eventName, interpolation: { escapeValue: false } })}
      </Heading>
      <Text>
        {t('speakers.event-invitation.introduction', {
          eventName,
          teamName,
          organizerName,
          interpolation: { escapeValue: false },
        })}
      </Text>

      {message ? (
        <Section className={styles.card}>
          <Text>{t('speakers.event-invitation.message')}</Text>
          <Text>
            {message.split('\n').map((line, index) => (
              <Fragment key={`${index}:${line}`}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </Text>
        </Section>
      ) : null}

      <Text>{t('speakers.event-invitation.consent')}</Text>
      <Section className="my-8 text-center">
        <Button href={invitationUrl} className={styles.button}>
          {t('speakers.event-invitation.cta')}
        </Button>
      </Section>
      <Text>{t('speakers.event-invitation.expiration')}</Text>
      <Text>{t('common.email.signature')}</Text>
    </BaseEmail>
  );
}

SpeakerInvitationEmail.buildPayload = (email: string, locale: string, data: TemplateData): EmailPayload => {
  const t = getEmailI18n(locale);
  return {
    template: 'speakers-event-invitation',
    subject: t('speakers.event-invitation.subject', {
      eventName: data.eventName,
      interpolation: { escapeValue: false },
    }),
    from: t('common.email.from.default'),
    to: [email],
    data,
    locale,
  };
};

SpeakerInvitationEmail.PreviewProps = {
  eventName: 'DevFest Nantes',
  teamName: 'DevFest team',
  organizerName: 'Alex',
  message: 'We enjoyed your talk about accessibility.\nWould you like to join our speaker lineup?',
  invitationUrl: 'http://localhost:3000/invite/event/preview-token',
  locale: 'en',
} as EmailProps;
