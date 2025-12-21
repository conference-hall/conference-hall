import { Button, Heading, Section, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { buildReviewProposalUrl } from '~/shared/emails/utils/urls.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

export type TemplateData = {
  event: {
    slug: string;
    name: string;
    logoUrl: string | null;
    emailOrganizer: string | null;
    emailNotifications: any;
    team: { slug: string };
  };
  proposal: { id: string; title: string; speakers: Array<{ name: string }> };
};

type EmailProps = TemplateData & LocaleEmailData;

export default function ProposalDeclinedEmail({ event, proposal, locale }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>{t('organizers.proposal-declined.body.title')}</Heading>

      <Section className={styles.card}>
        <Text>
          <strong>{proposal.title}</strong>
          <br />
          <i>{t('common.by', { names: proposal.speakers.map((speaker) => speaker.name) })}</i>
        </Text>
      </Section>

      <Section className="my-8 text-center">
        <Button href={buildReviewProposalUrl(event.team.slug, event.slug, proposal.id)} className={styles.button}>
          {t('organizers.proposal-declined.body.cta')}
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalDeclinedEmail.buildPayload = (data: TemplateData, locale = 'en'): EmailPayload => {
  if (!data.event.emailOrganizer) {
    throw new Error('Event organizer email is not set');
  }
  const t = getEmailI18n(locale);
  return {
    template: 'organizers-proposal-declined',
    subject: t('organizers.proposal-declined.subject', {
      event: data.event.name,
      interpolation: { escapeValue: false },
    }),
    from: t('common.email.from.event', { event: data.event.name, interpolation: { escapeValue: false } }),
    to: [data.event.emailOrganizer],
    data,
    locale,
  };
};

ProposalDeclinedEmail.PreviewProps = {
  event: {
    slug: 'awesome-event',
    name: 'Awesome event',
    logoUrl: 'https://picsum.photos/seed/123/128',
    team: { slug: 'awesome-team' },
  },
  proposal: { id: '123', title: 'My awesome proposal', speakers: [{ name: 'John Doe' }] },
} as EmailProps;
