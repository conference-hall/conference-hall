import { HeartIcon, MinusIcon, StarIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar, AvatarGroup } from '~/design-system/avatar.tsx';
import { buttonStyles } from '~/design-system/button.tsx';
import { Text } from '~/design-system/typography.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';

type ReviewMember = {
  id: string | undefined;
  name: string | undefined;
  picture: string | null | undefined;
  note: number | null;
  feeling: string;
  updatedAt: Date;
};

type Props = {
  reviews: Array<ReviewMember>;
};

const MAX_AVATARS = 3;

const ReviewIcons = {
  NO_OPINION: { Icon: MinusIcon, color: 'bg-gray-400' },
  NEUTRAL: { Icon: StarIcon, color: 'bg-yellow-500' },
  POSITIVE: { Icon: HeartIcon, color: 'bg-red-400' },
  NEGATIVE: { Icon: XMarkIcon, color: 'bg-gray-700' },
} as const;

export function ReviewsGroupEntry({ reviews }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const visibleAvatars = reviews.slice(0, MAX_AVATARS);
  const overflowCount = reviews.length - MAX_AVATARS;

  return (
    <ActivityFeed.Entry
      withLine
      marker={
        <div className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
          <StarIcon className="h-4 w-4 text-indigo-600" aria-hidden />
        </div>
      }
    >
      <div className="flex flex-col justify-between gap-2 rounded-md bg-indigo-50/50 p-3 ring-1 ring-indigo-100 ring-inset sm:flex-row sm:items-center">
        <div className="flex flex-col truncate sm:flex-row sm:items-center sm:gap-1">
          <div className="hidden items-center pr-2 sm:flex">
            <AvatarGroup avatars={visibleAvatars} size="xs" />
            {overflowCount > 0 ? (
              <Text size="xs" variant="secondary" className="ml-1">
                +{overflowCount}
              </Text>
            ) : null}
          </div>
          <Text size="s" weight="semibold">
            {t('event-management.proposal-page.activity-feed.reviews.title')}
            <span className="hidden sm:inline"> ⋅ </span>
          </Text>
          <Text size="s" variant="secondary">
            {t('event-management.proposal-page.activity-feed.reviews.count', { count: reviews.length })}
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className={buttonStyles({ variant: 'secondary', size: 'sm' })}
            onClick={() => setExpanded(!expanded)}
          >
            {t('event-management.proposal-page.activity-feed.reviews.button')}
          </button>
        </div>
      </div>

      {expanded ? (
        <ul className="mt-3 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="flex items-start gap-3">
              <Avatar picture={review.picture} name={review.name} size="xs" aria-hidden />
              <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1.5">
                  <Text size="xs" weight="medium">
                    {review.name}
                  </Text>
                  <ReviewIcon feeling={review.feeling as ReviewFeeling} />
                  {review.note !== null ? (
                    <Text size="xs" variant="secondary">
                      {review.note}/5
                    </Text>
                  ) : null}
                </div>
                <TimeDistance date={review.updatedAt} className="block text-xs text-gray-500" />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </ActivityFeed.Entry>
  );
}

function ReviewIcon({ feeling }: { feeling: ReviewFeeling }) {
  const review = ReviewIcons[feeling];
  return (
    <div className={cx('flex h-5 w-5 flex-none items-center justify-center rounded-full', review.color)}>
      <review.Icon className="h-3 w-3 text-white" aria-hidden />
    </div>
  );
}
