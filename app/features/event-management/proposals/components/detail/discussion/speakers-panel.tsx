import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { MessageBlock } from '~/features/conversations/components/message-block.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import { useOptimisticMessages } from '~/features/conversations/components/use-optimistic-messages.ts';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = {
  messages: Array<Message>;
  recipients: Array<{ name: string }>;
  canManageConversations: boolean;
};

export function SpeakersPanel({ messages, recipients, canManageConversations }: Props) {
  const user = useUser();
  const { t } = useTranslation();

  const { optimisticMessages, onOptimisticSaveMessage, onOptimisticDeleteMessage } = useOptimisticMessages(
    messages,
    'ORGANIZER',
  );

  const names = recipients.map((recipient) => recipient.name);
  const sendMessageLabel = t('common.conversation.send.label-with-recipients', { names });

  return (
    <div className="space-y-4 p-4">
      <Text size="xs" variant="secondary">
        {t('event-management.proposal-page.discussion.speakers.hint', { names, count: names.length })}
      </Text>

      {optimisticMessages.length > 0 ? (
        <ul className="space-y-4">
          {optimisticMessages.map((message) => (
            <li key={message.id} className="flex gap-3">
              <Avatar picture={message.sender.picture} name={message.sender.name} />
              <MessageBlock
                channel="speaker"
                message={message}
                canManageConversations={canManageConversations}
                isNew={message.isNew}
                onOptimisticSave={onOptimisticSaveMessage}
                onOptimisticDelete={onOptimisticDeleteMessage}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 py-8 text-gray-400">
          <ChatBubbleLeftRightIcon className="size-12" aria-hidden />
          <Subtitle weight="semibold">{t('common.conversation.empty-state', { count: names.length })}</Subtitle>
        </div>
      )}

      <div className="flex gap-3">
        <Avatar picture={user?.picture} name={user?.name} />
        <MessageInputForm
          channel="speaker"
          inputLabel={sendMessageLabel}
          placeholder={sendMessageLabel}
          buttonLabel={t('event-management.proposal-page.discussion.speakers.submit')}
          buttonVariant="primary"
          onOptimisticSave={onOptimisticSaveMessage}
        />
      </div>
    </div>
  );
}
