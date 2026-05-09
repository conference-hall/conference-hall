import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { StarIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { ActivityFeed } from '~/design-system/activity-feed/activity-feed.tsx';
import { Avatar, AvatarGroup } from '~/design-system/avatar.tsx';
import { Text } from '~/design-system/typography.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { feelingAndNoteToMarker, getReviewMarkerOptions } from '../../review-markers.config.ts';

const MAX_AVATARS = 3;

export type ReviewMember = {
  id: string;
  name: string;
  picture: string | null;
  note: number | null;
  feeling: ReviewFeeling;
  updatedAt: Date;
};

type Props = {
  reviews: Array<ReviewMember>;
};

// todo(reviews): add a total review at the end of the list
export function ReviewsGroupEntry({ reviews }: Props) {
  const { t } = useTranslation();

  const avatars = reviews.slice(0, MAX_AVATARS);
  const overflow = reviews.length - MAX_AVATARS;
  const markerOptions = getReviewMarkerOptions(t);

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
            <div className="hidden items-center pr-2 sm:flex">
              <AvatarGroup avatars={avatars} size="xs" />
              {overflow > 0 && (
                <div className="-ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
                  +{overflow}
                </div>
              )}
            </div>
            <Text size="s" weight="semibold">
              {t('event-management.proposal-page.activity-feed.reviews.title')}
              <span className="hidden sm:inline"> ⋅ </span>
            </Text>
            <Text size="s" variant="secondary">
              {t('event-management.proposal-page.activity-feed.reviews.count', { count: reviews.length })}
            </Text>
          </div>
          <ChevronDownIcon className="h-5 w-5 shrink-0 text-gray-500 group-data-open:rotate-180" />
        </DisclosureButton>

        <DisclosurePanel className="space-y-2 rounded-b-md border-t border-gray-200 bg-white p-3">
          {reviews.map((review) => {
            const marker = feelingAndNoteToMarker(review.feeling, review.note);
            const option = markerOptions.find((o) => o.value === marker);

            return (
              <div key={review.id} className="flex items-center gap-2">
                <Avatar picture={review.picture} name={review.name} size="xs" aria-hidden />
                <div className="flex min-w-0 items-baseline gap-1">
                  <Text size="xs" weight="semibold" truncate>
                    {review.name}
                  </Text>
                  <TimeDistance date={review.updatedAt} className="shrink-0 text-xs text-gray-500" />
                </div>
                {option && (
                  <div className="ml-auto flex shrink-0 items-center gap-1">
                    {review.note !== null && (
                      <Text size="s" weight="medium">
                        {review.note}
                      </Text>
                    )}
                    <option.icon className={cx('h-5 w-5', option.fill)} aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </DisclosurePanel>
      </Disclosure>
    </ActivityFeed.Entry>
  );
}
