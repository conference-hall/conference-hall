import { cx } from 'class-variance-authority';

import type { Feed } from '~/domains/proposal-reviews/ActivityFeed';

import { CommentItem } from './activity-feed-sections/comment-item';
import { NewCommentForm } from './activity-feed-sections/new-comment-form';
import { ReviewItem } from './activity-feed-sections/review-item';

type Props = { activity: Feed; picture?: string | null };

export function ActivityFeed({ activity }: Props) {
  return (
    <div className="pl-4 pt-4 space-y-6 lg:pb-8 lg:pr-32 ">
      {activity.length > 0 && (
        <ul aria-label="Activity feed" className="space-y-4">
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
