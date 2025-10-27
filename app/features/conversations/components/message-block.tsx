import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { EmojiPicker } from '~/design-system/emojis/emoji-picker.tsx';
import { EmojiReactions } from '~/design-system/emojis/emoji-reactions.tsx';
import { Text, typography } from '~/design-system/typography.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageActionsMenu } from './message-actions-menu.tsx';
import { MESSAGE_EMOJIS } from './message-emojis.tsx';
import { MessageInputForm } from './message-input-form.tsx';
import { useOptimisticReactions } from './use-optimistic-reactions.ts';

type Props = {
  message: Message;
  intentSuffix: string;
  canManageConversations?: boolean;
  className?: string;
};

export function MessageBlock({ message, intentSuffix, canManageConversations = false, className }: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isEditing, setEditing] = useState(false);
  const { reactions, onChangeReaction } = useOptimisticReactions(message, intentSuffix);

  return (
    <div
      id={message.id}
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
          canManageConversations={canManageConversations}
        />

        <EmojiPicker icon={FaceSmileIcon} variant="tertiary" emojis={MESSAGE_EMOJIS} onSelectEmoji={onChangeReaction} />
      </div>

      <div className="flex items-baseline gap-x-1">
        <Text size="xs" weight="semibold">
          {message.sender.name}
        </Text>
        <Text size="xs" variant="secondary">
          {t('common.conversation.message.sent')}
        </Text>
        <a href={`#${message.id}`} className={cx(typography({ size: 'xs', variant: 'secondary' }), 'hover:underline')}>
          <TimeDistance date={message.sentAt} />
        </a>
        {message.sender.role ? <Badge compact>{message.sender.role}</Badge> : null}
      </div>

      {isEditing ? (
        <MessageInputForm
          message={message}
          intent={`save-${intentSuffix}`}
          inputLabel={t('common.conversation.edit.label')}
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
