import { ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import { TimeDistance } from '~/design-system/utils/time-distance.tsx';
import type { ReviewFeeling } from '~/shared/types/proposals.types.ts';
import { ReviewNote } from '../../shared/review-note.tsx';

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

export type ReviewSummary = {
  average: number | null;
  positives: number;
  negatives: number;
};

export function countActiveReviews(reviews: Array<ReviewMember>) {
  return reviews.filter((review) => review.dismissedAt === null).length;
}

type Props = {
  reviews: Array<ReviewMember>;
  summary: ReviewSummary | null;
  canDismissReviews: boolean;
};

export function ReviewsPanel({ reviews, summary, canDismissReviews }: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <Text size="xs" variant="secondary" className="p-3 sm:px-4">
        {t('event-management.proposal-page.discussion.team-only-hint')}
      </Text>

      {reviews.length > 0 ? (
        <ul
          aria-label={t('event-management.proposal-page.discussion.tabs.reviews')}
          className="divide-y divide-gray-200 border-t border-gray-200"
        >
          {reviews.map((review) => (
            <ReviewRow key={review.id} review={review} canDismissReviews={canDismissReviews} />
          ))}
          <li className="flex items-center justify-between gap-2 rounded-b-lg bg-gray-50 p-3 sm:px-4">
            <Text size="s" weight="semibold">
              {t('event-management.proposal-page.reviews.global')}
            </Text>
            <ReviewNote
              feeling="NEUTRAL"
              note={summary?.average ?? null}
              label={t('event-management.proposal-page.reviews.global')}
            />
          </li>
        </ul>
      ) : (
        <Text size="s" variant="secondary" className="px-3 pb-3 sm:px-4 sm:pb-4">
          {t('event-management.proposal-page.discussion.reviews.empty')}
        </Text>
      )}
    </div>
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
    <li className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
      <Avatar picture={review.picture} name={review.name} size="xs" aria-hidden className={dismissedStyle} />
      <div className={cx('flex min-w-0 items-baseline gap-1', dismissedStyle)}>
        <Text size="s" weight="semibold" truncate>
          {review.name}
        </Text>
        <TimeDistance date={review.updatedAt} className="shrink-0 text-xs text-gray-500" tooltip="right" />
      </div>
      <div className="flex grow items-center justify-end gap-2">
        <ReviewNote feeling={review.feeling} note={review.note} className={dismissedStyle} />
        {canDismissReviews ? <ReviewActionsMenu reviewId={review.id} dismissed={dismissed} /> : null}
      </div>
    </li>
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
