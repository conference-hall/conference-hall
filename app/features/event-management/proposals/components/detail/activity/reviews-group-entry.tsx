import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { ChevronDownIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { StarIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar, AvatarGroup } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { ReviewNote } from '../../shared/review-note.tsx';

const MAX_AVATARS = 3;

export type ReviewMember = {
  id: string;
  userId: string;
  name: string;
  picture: string | null;
  note: number | null;
  feeling: ReviewFeeling;
  dismissedAt: Date | null;
  updatedAt: Date;
};

type ReviewSummary = {
  average: number | null;
  positives: number;
  negatives: number;
};

type Props = {
  reviews: Array<ReviewMember>;
  summary: ReviewSummary | null;
  canDismissReviews: boolean;
};

export function ReviewsGroupEntry({ reviews, summary, canDismissReviews }: Props) {
  const { t } = useTranslation();

  const activeReviews = reviews.filter((r) => r.dismissedAt === null);
  const avatars = activeReviews.slice(0, MAX_AVATARS);
  const overflow = activeReviews.length - MAX_AVATARS;

  return (
    <ActivityFeed.Entry
      withLine
      marker={
        <div className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full border border-gray-200 bg-white">
          <StarIcon className="h-4 w-4 text-gray-600" aria-hidden />
        </div>
      }
    >
      <Disclosure as="div" className="rounded-md bg-white ring-1 ring-gray-200">
        <DisclosureButton className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-t-md p-3 not-data-open:rounded-b-md hover:bg-gray-50">
          <div className="flex flex-col truncate sm:flex-row sm:items-center sm:gap-1">
            {avatars.length > 0 ? (
              <div className="hidden items-center pr-2 sm:flex">
                <AvatarGroup avatars={avatars} size="xs" />
                {overflow > 0 && (
                  <div className="-ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
                    +{overflow}
                  </div>
                )}
              </div>
            ) : null}
            <Text size="s" weight="semibold" align="left">
              {t('event-management.proposal-page.activity-feed.reviews.title')}
              <span className="hidden sm:inline"> ⋅ </span>
            </Text>
            <Text size="s" variant="secondary" align="left">
              {t('event-management.proposal-page.activity-feed.reviews.count', { count: activeReviews.length })}
            </Text>
          </div>
          <ChevronDownIcon className="h-5 w-5 shrink-0 text-gray-500 group-data-open:rotate-180" />
        </DisclosureButton>

        <DisclosurePanel className="rounded-b-md border-t border-gray-200 bg-white">
          <div className="space-y-2 p-3">
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} canDismissReviews={canDismissReviews} />
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-gray-200 px-3 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
              <UserGroupIcon className="h-5 w-5 text-gray-500" aria-hidden />
            </div>
            <Text size="xs" weight="semibold">
              {t('event-management.proposal-page.reviews.global')}
            </Text>
            <div className="ml-auto">
              <ReviewNote
                feeling="NEUTRAL"
                note={summary?.average ?? null}
                label={t('event-management.proposal-page.reviews.global')}
              />
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </ActivityFeed.Entry>
  );
}

type ReviewRowProps = {
  review: ReviewMember;
  canDismissReviews: boolean;
};

function ReviewRow({ review, canDismissReviews }: ReviewRowProps) {
  const dismissed = review.dismissedAt !== null;
  const dismissedStyle = dismissed ? 'opacity-40' : '';

  return (
    <div className="flex items-center gap-2">
      <Avatar picture={review.picture} name={review.name} size="xs" aria-hidden className={dismissedStyle} />
      <div className={cx('flex min-w-0 items-baseline gap-1', dismissedStyle)}>
        <Text size="xs" weight="semibold" truncate>
          {review.name}
        </Text>
        <TimeDistance date={review.updatedAt} className="shrink-0 text-xs text-gray-500" />
      </div>
      <div className="flex grow items-center justify-end gap-2">
        <ReviewNote feeling={review.feeling} note={review.note} className={dismissedStyle} />
        {canDismissReviews ? <ReviewActionsMenu reviewId={review.id} dismissed={dismissed} /> : null}
      </div>
    </div>
  );
}

type ReviewActionsMenuProps = { reviewId: string; dismissed: boolean };

function ReviewActionsMenu({ reviewId, dismissed }: ReviewActionsMenuProps) {
  const { t } = useTranslation();

  const intent = dismissed ? 'restore-review' : 'dismiss-review';
  const label = t(`event-management.proposal-page.reviews.${intent}`);
  const fetcher = useFetcher({ key: `${intent}:${reviewId}` });

  const handle = async () => {
    await fetcher.submit({ intent, reviewId }, { method: 'POST', preventScrollReset: true, flushSync: true });
  };

  return (
    <Tooltip text={label} placement="bottom" hideArrow>
      <Button
        type="button"
        onClick={handle}
        icon={dismissed ? ArrowUturnLeftIcon : XMarkIcon}
        label={label}
        variant="tertiary"
        size="xs"
      />
    </Tooltip>
  );
}
