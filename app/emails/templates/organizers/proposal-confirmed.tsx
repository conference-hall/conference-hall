import { Button, Heading, Section, Text } from '@react-email/components';
import { sendEmail } from '~/emails/send-email.job.ts';
import { buildReviewProposalUrl } from '~/emails/utils/urls.ts';
import type { EventEmailNotificationsKeys } from '~/types/events.types.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

type EmailData = {
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

export function sendProposalConfirmedEmailToOrganizers(data: EmailData) {
  const notifications = data.event.emailNotifications as EventEmailNotificationsKeys;
  if (!notifications.includes('confirmed')) return;

  if (!data.event.emailOrganizer) return;

  return sendEmail.trigger({
    template: 'organizers/proposal-confirmed',
    subject: `[${data.event.name}] Proposal confirmed by speaker`,
    from: `${data.event.name} <no-reply@conference-hall.io>`,
    to: [data.event.emailOrganizer],
    data,
  });
}

export default function ProposalConfirmedEmail({ event, proposal }: EmailData) {
  return (
    <BaseEventEmail logoUrl={event.logoUrl} preview={`"${proposal.title}" confirmed by speaker(s).`}>
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

ProposalConfirmedEmail.PreviewProps = {
  event: {
    slug: 'awesome-event',
    name: 'Awesome event',
    logoUrl: 'https://picsum.photos/seed/123/128',
    team: { slug: 'awesome-team' },
  },
  proposal: { id: '123', title: 'My awesome proposal', speakers: [{ name: 'John Doe' }] },
};
