import { useTranslation } from 'react-i18next';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import type { Feed } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import { CommentEntry } from './comment-entry.tsx';
import { CommentFormEntry } from './comment-form-entry.tsx';
import { ReviewEntry } from './review-entry.tsx';

type Props = { activity: Feed };

export function ProposalActivityFeed({ activity }: Props) {
  const { t } = useTranslation();

  return (
    <ActivityFeed label={t('event-management.proposal-page.activity-feed')} className="pl-4">
      <ActivityFeed.Entry className="h-6" withLine aria-hidden />

      {activity.map((item) => {
        if (item.type === 'comment') {
          return <CommentEntry key={item.id} item={item} />;
        } else if (item.type === 'review') {
          return <ReviewEntry key={item.id} item={item} />;
        } else {
          return null;
        }
      })}

      <CommentFormEntry />
    </ActivityFeed>
  );
}
