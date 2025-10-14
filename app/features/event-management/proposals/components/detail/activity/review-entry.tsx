import { HeartIcon, MinusIcon, StarIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { Trans } from 'react-i18next';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import type { FeedItem } from '~/features/event-management/proposals/services/activity-feed.server.ts';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';

const ReviewTypes = {
  NO_OPINION: {
    Icon: MinusIcon,
    color: 'bg-gray-400',
    i18nKey: 'event-management.proposal-page.activity-feed.no-opinion',
  },
  NEUTRAL: { Icon: StarIcon, color: 'bg-yellow-500', i18nKey: 'event-management.proposal-page.activity-feed.reviewed' },
  POSITIVE: { Icon: HeartIcon, color: 'bg-red-400', i18nKey: 'event-management.proposal-page.activity-feed.reviewed' },
  NEGATIVE: { Icon: XMarkIcon, color: 'bg-gray-700', i18nKey: 'event-management.proposal-page.activity-feed.reviewed' },
} as const;

export function ReviewEntry({ item }: { item: FeedItem }) {
  if (item.type !== 'review') return null;

  const review = ReviewTypes[item.feeling];

  return (
    <ActivityFeed.Entry
      marker={<ReviewIcon feeling={item.feeling} />}
      className="flex flex-col sm:flex-row gap-1 p-1"
      withLine
    >
      <p className="text-xs text-gray-500">
        <Trans
          i18nKey={review.i18nKey}
          values={{ name: item.user, count: item.note }}
          components={[<span key="1" className="font-medium text-gray-900" />, <strong key="2" />]}
        />
      </p>
      <TimeDistance date={item.timestamp} className="flex-none text-xs text-gray-500" />
    </ActivityFeed.Entry>
  );
}

function ReviewIcon({ feeling }: { feeling: ReviewFeeling }) {
  const review = ReviewTypes[feeling];

  return (
    <div className={cx('relative flex h-6 w-6 flex-none items-center justify-center rounded-full z-10', review.color)}>
      <review.Icon className="h-4 w-4 text-white" aria-hidden="true" />
    </div>
  );
}
