import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { EmojiPicker } from '~/design-system/emojis/emoji-picker.tsx';
import { EmojiReactions } from '~/design-system/emojis/emoji-reactions.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDistance } from '~/shared/datetimes/datetimes.ts';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageActionsMenu } from './message-actions-menu.tsx';
import { MESSAGE_EMOJIS } from './message-emojis.tsx';
import { MessageInputForm } from './message-input-form.tsx';
import { useOptimisticReactions } from './use-optimistic-reactions.ts';

type Props = {
  message: Message;
  intentSuffix: string;
  className?: string;
};

export function MessageBlock({ message, intentSuffix, className }: Props) {
  const { t, i18n } = useTranslation();
  const currentUser = useUser();

  const [isEditing, setEditing] = useState(false);
  const { reactions, onChangeReaction } = useOptimisticReactions(message, intentSuffix);

  return (
    <div
      className={cx(
        'relative group w-full rounded-md p-4 space-y-1.5 ring-1 ring-inset ring-gray-200 bg-white',
        className,
      )}
    >
      <div className="absolute right-0 top-0 p-2 flex gap-x-1 text-gray-500">
        <MessageActionsMenu
          message={message}
          intentSuffix={intentSuffix}
          onEdit={() => setEditing(!isEditing)}
          className="h-6 w-6 flex items-center justify-center hover:bg-gray-100 cursor-pointer rounded"
        />

        <EmojiPicker
          icon={FaceSmileIcon}
          emojis={MESSAGE_EMOJIS}
          onSelectEmoji={onChangeReaction}
          className="h-6 w-6 flex items-center justify-center hover:bg-gray-100 cursor-pointer rounded"
        />
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
        <MessageInputForm
          message={message}
          intent={`save-${intentSuffix}`}
          inputLabel={t('event-management.proposal-page.comment.label')}
          placeholder={t('event-management.proposal-page.comment.placeholder')}
          onClose={() => setEditing(false)}
          autoFocus
        />
      ) : (
        <Text className="whitespace-pre-line break-words">{message.content}</Text>
      )}

      {reactions.length > 0 ? (
        <EmojiReactions
          emojis={MESSAGE_EMOJIS}
          reactions={reactions}
          currentUserId={currentUser?.id}
          onChangeEmoji={onChangeReaction}
        />
      ) : null}
    </div>
  );
}
