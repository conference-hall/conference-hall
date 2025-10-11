import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/design-system/badges.tsx';
import { EmojiPicker } from '~/design-system/emojis/emoji-picker.tsx';
import { EmojiReactions } from '~/design-system/emojis/emoji-reactions.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import { EMOJIS, useOptimisticReactions } from './use-optimistic-reactions.ts';

type Props = {
  message: Message;
  reactIntent: string;
  className?: string;
};

export function MessageBlock({ message, reactIntent, className }: Props) {
  const { i18n } = useTranslation();

  const [isEditing] = useState(false);
  const { optimisticReactions, onChangeEmoji } = useOptimisticReactions(message.id, reactIntent, message.reactions);

  return (
    <div
      className={cx(
        'relative group w-full rounded-md p-4 space-y-1.5 ring-1 ring-inset ring-gray-200 bg-white',
        className,
      )}
    >
      <div className="absolute right-0 top-0 p-2 flex gap-x-1 text-gray-500">
        <EmojiPicker
          icon={FaceSmileIcon}
          emojis={EMOJIS}
          disabledEmojis={optimisticReactions.map((reaction) => reaction.code)}
          onSelectEmoji={onChangeEmoji}
          className="p-1 hover:bg-gray-100 cursor-pointer rounded"
        />

        <button type="button" className="p-1 hover:bg-gray-100 cursor-pointer rounded">
          <EllipsisHorizontalIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-baseline gap-x-1">
        <Text size="xs" weight="semibold">
          {message.sender.name}
        </Text>

        <ClientOnly>
          {() => (
            <time dateTime={message.sentAt.toISOString()} className="text-xs text-gray-500 mr-1">
              a envoyé, {formatDistance(message.sentAt, i18n.language)}
            </time>
          )}
        </ClientOnly>

        {message.sender.role ? <Badge compact>{message.sender.role}</Badge> : null}
      </div>

      {isEditing ? (
        // @ts-expect-error fieldSizing not supported yet
        <TextArea defaultValue={message.content} style={{ fieldSizing: 'content', maxHeight: '400px' }} />
      ) : (
        <Text className="whitespace-pre-line break-words">{message.content}</Text>
      )}

      {optimisticReactions.length > 0 ? (
        // todo(conversation): order is not consistent
        <EmojiReactions emojis={EMOJIS} reactions={optimisticReactions} onChangeEmoji={onChangeEmoji} />
      ) : null}
    </div>
  );
}
