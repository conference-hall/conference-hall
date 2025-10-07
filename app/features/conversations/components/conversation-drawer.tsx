import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { type ReactNode, useState } from 'react';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageBlock } from './message-block.tsx';
import { MessageInputForm } from './message-input-form.tsx';

type Props = {
  messages: Array<Message>;
  children: ReactNode;
  className?: string;
};

// todo(conversation): optimistic rendering
export function ConversationDrawer({ messages, children, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      <SlideOver open={open} onClose={() => setOpen(false)} withBorder={false} size="l">
        {/* todo(conversation): set title as sr-only in SlideOver */}
        <h2 className="sr-only">Conversation</h2>

        {messages.length === 0 ? (
          <SlideOver.Content className="flex flex-col gap-6 items-center justify-center text-gray-400">
            <ChatBubbleLeftRightIcon className="h-16 w-16" aria-hidden />
            <Subtitle>
              Start a conversation with <strong>Peter Parker</strong>
            </Subtitle>
          </SlideOver.Content>
        ) : (
          <SlideOver.Content className="flex flex-col justify-end">
            {messages.map((message) => (
              <MessageBlock key={message.id} message={message} />
            ))}
          </SlideOver.Content>
        )}

        <SlideOver.Actions>
          <MessageInputForm
            name="message"
            intent="add-message"
            inputLabel="Envoyer un message"
            buttonLabel="Envoyer"
            placeholder="Envoyer un message à Peter Parker"
            autoFocus
          />
        </SlideOver.Actions>
      </SlideOver>
    </>
  );
}
