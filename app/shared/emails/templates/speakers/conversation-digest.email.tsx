import { Button, Heading, Hr, Img, Link, Section, Text } from 'react-email';
import type { LocaleEmailData } from '~/shared/emails/email.types.ts';
import type { EmailPayload } from '~/shared/emails/send-email.job.ts';
import { getEmailI18n } from '~/shared/i18n/i18n.emails.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import BaseEmail, { styles } from '../base.email.tsx';

// A single conversation line: how many new messages and where to open them. The "Open" url and
// the thread type are pre-shaped by the orchestrator (1c) — the template only renders them.
type DigestConversation = {
  type: 'speaker' | 'review';
  count: number;
  url: string;
};

type DigestProposal = {
  title: string;
  conversations: Array<DigestConversation>;
};

export type DigestEvent = {
  name: string;
  logo: string | null;
  proposals: Array<DigestProposal>;
};

export type TemplateData = {
  email: string;
  events: Array<DigestEvent>;
  unsubscribeUrl?: string;
};

type EmailProps = TemplateData & LocaleEmailData;

export default function ConversationDigestEmail({ events, locale, unsubscribeUrl }: EmailProps) {
  const t = getEmailI18n(locale);

  return (
    <BaseEmail locale={locale}>
      <Heading className={styles.h1}>{t('speakers.conversation-digest.body.title')}</Heading>
      <Text>{t('speakers.conversation-digest.body.intro')}</Text>

      {events.map((event, eventIndex) => (
        <Section key={`${event.name}-${eventIndex}`} className={styles.card}>
          <Section className="flex items-center gap-2">
            {resolveStorageUrl(event.logo) ? (
              <Img height={24} width={24} src={resolveStorageUrl(event.logo) ?? undefined} alt="" className="rounded" />
            ) : null}
            <Heading as="h2" className="text-base font-semibold">
              {event.name}
            </Heading>
          </Section>

          {event.proposals.map((proposal, proposalIndex) => (
            <Section key={`${proposal.title}-${proposalIndex}`} className="my-2">
              <Text className="font-semibold">{proposal.title}</Text>

              {proposal.conversations.map((conversation, conversationIndex) => (
                <Section key={`${conversation.type}-${conversationIndex}`} className="my-2">
                  <Text className="my-0 text-sm">
                    {t(`speakers.conversation-digest.thread.${conversation.type}`)} —{' '}
                    {t('speakers.conversation-digest.body.messages', { count: conversation.count })}
                  </Text>
                  <Button href={conversation.url} className={styles.button}>
                    {t('speakers.conversation-digest.body.open')}
                  </Button>
                </Section>
              ))}
            </Section>
          ))}
        </Section>
      ))}

      {unsubscribeUrl ? (
        <>
          <Hr />
          <Text className="text-center text-xs text-gray-400">
            <Link href={unsubscribeUrl} className="text-gray-400 underline">
              {t('speakers.conversation-digest.body.unsubscribe')}
            </Link>
          </Text>
        </>
      ) : null}
    </BaseEmail>
  );
}

ConversationDigestEmail.buildPayload = (data: TemplateData, locale: string): EmailPayload => {
  const t = getEmailI18n(locale);

  return {
    template: 'speakers-conversation-digest',
    subject: t('speakers.conversation-digest.subject'),
    from: t('common.email.from.default'),
    to: [data.email],
    data,
    locale,
    headers: data.unsubscribeUrl ? { 'List-Unsubscribe': `<${data.unsubscribeUrl}>` } : undefined,
  };
};

ConversationDigestEmail.PreviewProps = {
  email: 'speaker@example.com',
  locale: 'en',
  unsubscribeUrl: 'https://conference-hall.io/unsubscribe?token=preview',
  events: [
    {
      name: 'Awesome Conference',
      logo: 'seed/123/128.png',
      proposals: [
        {
          title: 'Designing deep modules',
          conversations: [
            { type: 'speaker', count: 3, url: 'https://conference-hall.io/awesome/proposals/p1?conversation=speaker' },
          ],
        },
        {
          title: 'A talk about testing',
          conversations: [
            { type: 'speaker', count: 1, url: 'https://conference-hall.io/awesome/proposals/p2?conversation=speaker' },
            { type: 'review', count: 2, url: 'https://conference-hall.io/awesome/proposals/p2?conversation=review' },
          ],
        },
      ],
    },
  ],
} as EmailProps;
