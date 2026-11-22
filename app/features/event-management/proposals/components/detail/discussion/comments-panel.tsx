import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { Text } from '~/design-system/typography.tsx';
import { MessageBlock } from '~/features/conversations/components/message-block.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = { comments: Array<Message>; canManageConversations: boolean };

export function CommentsPanel({ comments, canManageConversations }: Props) {
  const user = useUser();
  const { t } = useTranslation();

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <Text size="xs" variant="secondary">
        {t('event-management.proposal-page.discussion.team-only-hint')}
      </Text>

      {comments.length > 0 ? (
        <ul aria-label={t('event-management.proposal-page.discussion.comments.messages')} className="space-y-6">
          {comments.map((message) => (
            <li key={message.id} className={cx('flex gap-3', message.isNew ? '-mx-2 rounded-md bg-blue-50 p-2' : null)}>
              <Avatar picture={message.sender.picture} name={message.sender.name} className="hidden sm:flex" />
              <MessageBlock
                channel="comment"
                message={message}
                canManageConversations={canManageConversations}
                showAvatarOnMobile
                plain
                showRoleBadge={false}
                isNew={message.isNew}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-3">
        <Avatar picture={user?.picture} name={user?.name} className="hidden sm:flex" />
        <MessageInputForm
          channel="comment"
          inputLabel={t('event-management.proposal-page.comment.label')}
          buttonLabel={t('event-management.proposal-page.comment.submit')}
          placeholder={t('event-management.proposal-page.comment.placeholder')}
        />
      </div>
    </div>
  );
}
