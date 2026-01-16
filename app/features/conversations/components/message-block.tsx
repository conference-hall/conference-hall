import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { EmojiPicker } from '~/design-system/emojis/emoji-picker.tsx';
import { EmojiReactions } from '~/design-system/emojis/emoji-reactions.tsx';
import { Text, typography } from '~/design-system/typography.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import { MessageActionsMenu } from './message-actions-menu.tsx';
import { MESSAGE_EMOJIS } from './message-emojis.tsx';
import { MessageInputForm } from './message-input-form.tsx';
import { useOptimisticReactions } from './use-optimistic-reactions.ts';

type Props = {
  message: Message;
  intentSuffix: string;
  onOptimisticSave?: (data: { id?: string; content: string }) => void;
  onOptimisticDelete?: (id: string) => void;
  canManageConversations?: boolean;
  className?: string;
};

export function MessageBlock({
  message,
  intentSuffix,
  onOptimisticSave,
  onOptimisticDelete,
  canManageConversations = false,
  className,
}: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isEditing, setEditing] = useState(false);
  const { reactions, onChangeReaction } = useOptimisticReactions(message, intentSuffix);

  return (
    <div
      id={message.id}
      className={cx(
        'group relative w-full space-y-1.5 rounded-md bg-white p-4 ring-1 ring-gray-200 ring-inset',
        className,
      )}
    >
      <div className="absolute top-0 right-0 flex gap-x-1 p-2 text-gray-500">
        <MessageActionsMenu
          message={message}
          intentSuffix={intentSuffix}
          onEdit={() => setEditing(!isEditing)}
          onDelete={onOptimisticDelete}
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
          onOptimisticSave={onOptimisticSave}
          onClose={() => setEditing(false)}
          autoFocus
        />
      ) : (
        <Text className="wrap-break-word whitespace-pre-line">{message.content}</Text>
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
