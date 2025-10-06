import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '~/design-system/avatar.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import type { EmojiReaction } from '~/shared/types/emojis.types.ts';
import { MessageInputForm } from './message-input-form.tsx';

type Message = {
  id: string;
  timestamp: Date;
  user: string;
  userId: string;
  picture: string | null;
  comment: string;
  reactions: Array<EmojiReaction>;
};

type Props = {
  enabled: boolean;
  messages: Array<Message>;
  children: ReactNode;
  className?: string;
};

// todo(conversation): to move in design system ?
// todo(conversation): remove enabled from the component
// todo(conversation): optimistic rendenring ?
export function ConversationDrawer({ enabled, messages, children, className }: Props) {
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      <SlideOver open={open} onClose={() => setOpen(false)} withBorder={false} size="l">
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
            intent="add-comment"
            channel="SPEAKER"
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

// todo(conversation): FeedItem type should be shared (not on server)
export function MessageBlock({ message }: { message: Message }) {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-4 p-3 w-full rounded-lg hover:bg-gray-50">
      <Avatar picture={message.picture} name={message.user} size="s" square className="mt-1" />

      <div className="w-full">
        <div className="flex items-baseline gap-x-2">
          <Text weight="semibold">{message.user}</Text>

          <ClientOnly>
            {() => (
              <time dateTime={message.timestamp.toISOString()} className="text-xs text-gray-500">
                {formatDistance(message.timestamp, i18n.language)}
              </time>
            )}
          </ClientOnly>

          <Badge compact color={message.userId === '1' ? 'indigo' : 'gray'}>
            {message.userId === '1' ? 'Speaker' : 'Organizer'}
          </Badge>
        </div>

        <Text className="whitespace-pre-line break-words">{message.comment}</Text>
      </div>
    </div>
  );
}
