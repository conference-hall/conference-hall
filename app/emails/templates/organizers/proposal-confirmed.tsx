import { Button, Heading, Section, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/emails/email.types.ts';
import type { EmailPayload } from '~/emails/send-email.job.ts';
import { buildReviewProposalUrl } from '~/emails/utils/urls.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type TemplateData = {
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

export default function ProposalConfirmedEmail({ event, proposal, locale }: EmailProps) {
  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>Proposal confirmed by speaker(s)!</Heading>

      <Section className={styles.card}>
        <Text>
          <strong>{proposal.title}</strong>
          <br />
          <i>by {proposal.speakers.map((speaker) => speaker.name).join(', ')}</i>
        </Text>
      </Section>

      <Section className="text-center my-[32px]">
        <Button href={buildReviewProposalUrl(event.team.slug, event.slug, proposal.id)} className={styles.button}>
          See the proposal
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ProposalConfirmedEmail.buildPayload = (data: TemplateData): EmailPayload => {
  if (!data.event.emailOrganizer) {
    throw new Error('Event organizer email is not set');
  }
  return {
    template: 'organizers/proposal-confirmed',
    subject: `[${data.event.name}] Proposal confirmed by speaker`,
    from: `${data.event.name} <no-reply@mg.conference-hall.io>`,
    to: [data.event.emailOrganizer],
    data,
    locale: 'en',
  };
};

ProposalConfirmedEmail.PreviewProps = {
  event: {
    slug: 'awesome-event',
    name: 'Awesome event',
    logoUrl: 'https://picsum.photos/seed/123/128',
    team: { slug: 'awesome-team' },
  },
  proposal: { id: '123', title: 'My awesome proposal', speakers: [{ name: 'John Doe' }] },
} as EmailProps;
