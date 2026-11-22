import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { Badge } from '~/design-system/badges.tsx';
import { StatusPill } from '~/design-system/charts/status-pill.tsx';
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
  channel: string;
  onOptimisticSave?: (data: { id?: string; content: string }) => void;
  onOptimisticDelete?: (id: string) => void;
  canManageConversations?: boolean;
  showRoleBadge?: boolean;
  showAvatarOnMobile?: boolean;
  isNew?: boolean;
  plain?: boolean;
  className?: string;
};

export function MessageBlock({
  message,
  channel,
  onOptimisticSave,
  onOptimisticDelete,
  canManageConversations = false,
  showRoleBadge = true,
  showAvatarOnMobile = false,
  isNew = false,
  plain = false,
  className,
}: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();

  const [isEditing, setEditing] = useState(false);
  const { reactions, onChangeReaction } = useOptimisticReactions(message, channel);

  return (
    <div
      id={message.id}
      className={cx(
        'group relative w-full',
        plain
          ? 'space-y-0.5'
          : ['space-y-1.5 rounded-md bg-white p-4 ring-1 ring-inset', isNew ? 'ring-blue-400' : 'ring-gray-200'],
        className,
      )}
    >
      <div className={cx('absolute top-0 right-0 flex gap-x-1 text-gray-500', plain ? '-mt-1.5' : 'p-2')}>
        <MessageActionsMenu
          message={message}
          channel={channel}
          onEdit={() => setEditing(!isEditing)}
          onDelete={onOptimisticDelete}
          canManageConversations={canManageConversations}
        />

        <EmojiPicker icon={FaceSmileIcon} variant="tertiary" emojis={MESSAGE_EMOJIS} onSelectEmoji={onChangeReaction} />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-1 pr-14">
        {showAvatarOnMobile ? (
          <Avatar
            picture={message.sender.picture}
            name={message.sender.name}
            size="xs"
            aria-hidden
            className="mr-1 self-center sm:hidden"
          />
        ) : null}
        <Text size="xs" weight="semibold">
          {message.sender.name}
        </Text>
        <Text size="xs" variant="secondary">
          {t('common.conversation.message.sent')}
        </Text>
        <a href={`#${message.id}`} className={cx(typography({ size: 'xs', variant: 'secondary' }), 'hover:underline')}>
          <TimeDistance date={message.sentAt} tooltip="right" />
        </a>
        {showRoleBadge && message.sender.role ? <Badge compact>{message.sender.role}</Badge> : null}
        {plain && isNew ? (
          <span className="ml-1 flex items-center gap-1 self-center text-xs font-semibold text-blue-700">
            <StatusPill status="info" size="sm" />
            {t('common.new')}
          </span>
        ) : null}
      </div>

      {isEditing ? (
        <MessageInputForm
          message={message}
          channel={channel}
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
