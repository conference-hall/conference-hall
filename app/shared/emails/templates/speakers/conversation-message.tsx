import { Button, Heading, Section, Text } from '@react-email/components';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { buildReviewProposalUrl, buildSpeakerProposalUrl } from '~/shared/emails/utils/urls.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import type { MessageRole } from '~/shared/types/conversation.types.ts';
import { styles } from '../base-email.tsx';
import BaseEventEmail from '../base-event-email.tsx';

export type TemplateData = {
  recipient: {
    email: string;
    role: MessageRole | null;
  };
  event: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    teamSlug: string;
  };
  proposal?: {
    id: string;
  };
  sender: {
    name: string;
    role: MessageRole | null;
  };
  message: {
    content: string;
    preview: string;
  };
  messagesCount: number;
};

type EmailProps = TemplateData & LocaleEmailData;

export default function ConversationMessageEmail({
  recipient,
  event,
  proposal,
  sender,
  message,
  messagesCount,
  locale,
}: EmailProps) {
  const t = getEmailI18n(locale);

  // Build URL based on recipient role
  const conversationUrl = proposal
    ? recipient.role === 'SPEAKER'
      ? buildSpeakerProposalUrl(event.slug, proposal.id)
      : buildReviewProposalUrl(event.teamSlug, event.slug, proposal.id)
    : '#';

  return (
    <BaseEventEmail locale={locale} logoUrl={event.logoUrl}>
      <Heading className={styles.h1}>{t('speakers.conversation-message.body.title')}</Heading>

      <Text>
        {messagesCount === 1
          ? t('speakers.conversation-message.body.text-single', {
              sender: sender.name,
              event: event.name,
              interpolation: { escapeValue: false },
            })
          : t('speakers.conversation-message.body.text-multiple', {
              sender: sender.name,
              count: messagesCount,
              event: event.name,
              interpolation: { escapeValue: false },
            })}
      </Text>

      {messagesCount === 1 && message.preview && (
        <Section className={styles.card}>
          <Text className="text-gray-700 italic">
            {message.preview}
            {message.content.length > message.preview.length && '...'}
          </Text>
        </Section>
      )}

      <Section className="text-center my-8">
        <Button href={conversationUrl} className={styles.button}>
          {t('speakers.conversation-message.body.cta')}
        </Button>
      </Section>
    </BaseEventEmail>
  );
}

ConversationMessageEmail.buildPayload = (data: TemplateData, localeOverride?: string): EmailPayload => {
  const locale = localeOverride || 'en';
  const t = getEmailI18n(locale);

  return {
    template: 'speakers-conversation-message',
    subject: t('speakers.conversation-message.subject', {
      event: data.event.name,
      interpolation: { escapeValue: false },
    }),
    from: t('common.email.from.event', { event: data.event.name, interpolation: { escapeValue: false } }),
    to: [data.recipient.email],
    data,
    locale,
    customEventId: data.event.id,
  };
};

ConversationMessageEmail.PreviewProps = {
  recipient: {
    email: 'joe@email.com',
    role: 'SPEAKER',
  },
  event: {
    id: '123',
    slug: 'awesome-event',
    name: 'Awesome Event',
    logoUrl: 'https://picsum.photos/seed/123/128',
    teamSlug: 'awesome-team',
  },
  proposal: {
    id: 'proposal-123',
  },
  sender: {
    name: 'John Doe',
    role: 'ORGANIZER',
  },
  message: {
    content: 'This is a test message to show how the email looks like with some content.',
    preview: 'This is a test message to show how the email looks like with some content.',
  },
  messagesCount: 1,
} as EmailProps;
