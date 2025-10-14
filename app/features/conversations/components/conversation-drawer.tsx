import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { type ReactNode, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Avatar } from '~/design-system/avatar.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageBlock } from './message-block.tsx';
import { MessageInputForm } from './message-input-form.tsx';

type Props = {
  messages: Array<Message>;
  recipients?: Array<string>;
  children: ReactNode;
  className?: string;
};

// todo(conversation): optimistic rendering
export function ConversationDrawer({ messages, recipients = [], children, className }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const sendMessageLabel =
    recipients.length > 0
      ? t('common.conversation.send.label-with-recipients', { names: recipients })
      : t('common.conversation.send.label');

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {/* todo(conversation): title with persons avatars in it (ex: speakers) */}
      <SlideOver title={recipients.join(', ')} open={open} onClose={() => setOpen(false)} withBorder={false} size="l">
        <h2 className="sr-only">{t('common.conversation.title')}</h2>

        {messages.length === 0 ? (
          <SlideOver.Content className="flex flex-col gap-6 items-center justify-center text-gray-400">
            <ChatBubbleLeftRightIcon className="h-16 w-16" aria-hidden />
            <Subtitle>
              {recipients.length > 0 ? (
                <Trans
                  i18nKey="common.conversation.empty-state-with-recipients"
                  values={{ names: recipients }}
                  components={[<strong key="0" />]}
                />
              ) : (
                t('common.conversation.empty-state')
              )}
            </Subtitle>
          </SlideOver.Content>
        ) : (
          <SlideOver.Content className="flex flex-col gap-6 justify-end">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                <Avatar picture={message.sender.picture} name={message.sender.name} size="s" className="mt-1" />
                <MessageBlock intentSuffix="message" message={message} />
              </div>
            ))}
          </SlideOver.Content>
        )}

        <SlideOver.Actions>
          <MessageInputForm
            intent="save-message"
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
