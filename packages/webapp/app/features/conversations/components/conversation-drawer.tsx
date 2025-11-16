import type { Message } from '@conference-hall/shared/types/conversation.types.ts';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarGroup } from '~/design-system/avatar.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { MessageBlock } from './message-block.tsx';
import { MessageInputForm } from './message-input-form.tsx';
import { useOptimisticMessages } from './use-optimistic-messages.ts';

type Props = {
  messages: Array<Message>;
  recipients?: Array<{ picture?: string | null; name?: string | null }>;
  children: ReactNode;
  canManageConversations: boolean;
  className?: string;
};

export function ConversationDrawer({ messages, recipients = [], children, canManageConversations, className }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const intentSuffix = 'message';
  const optimisticMessages = useOptimisticMessages(messages, intentSuffix, 'ORGANIZER');

  const recipientNames = recipients.map((recipient) => recipient.name);
  const sendMessageLabel =
    recipientNames.length > 0
      ? t('common.conversation.send.label-with-recipients', { names: recipientNames })
      : t('common.conversation.send.label');

  const DrawerHeader = (
    <header className="space-y-4">
      <H2>{t('common.conversation.title', { count: recipients.length })}</H2>
      <div className="flex items-center gap-2">
        <AvatarGroup avatars={recipients} size="xs" />
        <Text weight="normal" truncate>
          {t('common.list', { items: recipientNames })}
        </Text>
      </div>
    </header>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      <SlideOver title={DrawerHeader} open={open} onClose={() => setOpen(false)} withBorder={false} size="l">
        {optimisticMessages.length === 0 ? (
          <SlideOver.Content className="flex flex-col items-center justify-center gap-6 text-gray-400 border-t border-t-gray-200">
            <ChatBubbleLeftRightIcon className="h-16 w-16" aria-hidden />
            <Subtitle weight="semibold">{t('common.conversation.empty-state', { count: recipients.length })}</Subtitle>
          </SlideOver.Content>
        ) : (
          <SlideOver.Content as="ul" className="flex flex-col-reverse gap-6 pb-6 border-t border-t-gray-200">
            {optimisticMessages.reverse().map((message) => (
              <li key={message.id} className="flex gap-4">
                <Avatar picture={message.sender.picture} name={message.sender.name} size="s" className="mt-1" />
                <MessageBlock
                  intentSuffix={intentSuffix}
                  message={message}
                  canManageConversations={canManageConversations}
                />
              </li>
            ))}
          </SlideOver.Content>
        )}

        <SlideOver.Actions className="pt-0">
          <MessageInputForm
            intent={`save-${intentSuffix}`}
            buttonLabel={t('common.send')}
            inputLabel={sendMessageLabel}
            placeholder={sendMessageLabel}
            autoFocus
          />
        </SlideOver.Actions>
      </SlideOver>
    </>
  );
}
