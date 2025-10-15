import { useTranslation } from 'react-i18next';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar } from '~/design-system/avatar.tsx';
import { MessageInputForm } from '~/features/conversations/components/message-input-form.tsx';
import type { Feed } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import { CommentEntry } from './comment-entry.tsx';
import { ReviewEntry } from './review-entry.tsx';

type Props = { activity: Feed; canManageConversations: boolean };

export function ProposalActivityFeed({ activity, canManageConversations }: Props) {
  const user = useUser();
  const { t } = useTranslation();

  return (
    <ActivityFeed label={t('event-management.proposal-page.activity-feed')} className="pl-4">
      <ActivityFeed.Entry className="h-6" withLine aria-hidden />

      {activity.map((item) => {
        if (item.type === 'comment') {
          return <CommentEntry key={item.id} item={item} canManageConversations={canManageConversations} />;
        } else if (item.type === 'review') {
          return <ReviewEntry key={item.id} item={item} />;
        } else {
          return null;
        }
      })}

      <ActivityFeed.Entry marker={<Avatar picture={user?.picture} name={user?.name} />}>
        <MessageInputForm
          intent="save-comment"
          inputLabel={t('event-management.proposal-page.comment.label')}
          buttonLabel={t('event-management.proposal-page.comment.submit')}
          placeholder={t('event-management.proposal-page.comment.placeholder')}
        />
      </ActivityFeed.Entry>
    </ActivityFeed>
  );
}
