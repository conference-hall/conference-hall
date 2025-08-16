import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import type { Feed } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import { CommentItem } from './comment-item.tsx';
import { NewCommentForm } from './new-comment-form.tsx';
import { ReviewItem } from './review-item.tsx';

type Props = { activity: Feed };

export function ProposalActivityFeed({ activity }: Props) {
  const { t } = useTranslation();
  return (
    <div className="pl-4 pt-4 space-y-6 lg:pb-8 lg:pr-32 ">
      {activity.length > 0 && (
        <ul aria-label={t('event-management.proposal-page.activity-feed')} className="space-y-4">
          {activity.map((item, index) => (
            <li key={item.id} className="relative flex gap-x-4">
              <FeedLine index={index} total={activity.length} />
              <CommentItem item={item} />
              <ReviewItem item={item} />
            </li>
          ))}
        </ul>
      )}

      <NewCommentForm className="flex gap-x-3" />
    </div>
  );
}

function FeedLine({ index, total }: { index: number; total: number }) {
  return (
    <div className={cx(index === total - 1 ? 'h-12' : '-bottom-8', 'absolute left-0 -top-8 flex w-6 justify-center')}>
      <div className="w-px bg-gray-300" />
    </div>
  );
}
