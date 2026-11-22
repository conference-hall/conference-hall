import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { H2 } from '~/design-system/typography.tsx';
import {
  getReviewMarkerOptions,
  type MarkerValue,
} from '~/features/event-management/proposals/components/shared/review-markers.config.ts';
import type { UserReview } from '~/shared/types/proposals.types.ts';
import { useProposalNavigation } from '../use-proposal-navigation.ts';
import { useOptimisticReview } from './use-optimistic-review.ts';

const SELECTED_STYLES: Partial<Record<MarkerValue, { button: string; icon: string }>> = {
  'no-opinion': { button: 'border-gray-500 bg-gray-100 text-gray-900', icon: 'stroke-gray-600' },
  negative: { button: 'border-red-400 bg-red-50 text-red-700', icon: 'stroke-red-600' },
  positive: { button: 'border-rose-400 bg-rose-50 text-rose-700', icon: 'fill-red-400 stroke-red-400' },
};

const NAVIGATION_STYLES =
  'flex h-13 w-11 shrink-0 short:h-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 aria-disabled:pointer-events-none aria-disabled:opacity-50';

type Props = { team: string; event: string; previous?: string; next?: string; initialValues: UserReview };

export function ReviewBar({ team, event, previous, next, initialValues }: Props) {
  const { t } = useTranslation();
  const { previousPath, nextPath, search } = useProposalNavigation({ team, event, previous, next });
  const titleId = useId();
  const { optimisticMarker, handleSubmit } = useOptimisticReview(initialValues);
  const options = getReviewMarkerOptions(t);
  const stars = options.filter((option) => option.cumulative);
  const selectedStar = stars.findIndex((option) => option.value === optimisticMarker);
  const filledStars = optimisticMarker === 'positive' ? stars.length : selectedStar + 1;
  const currentOption = options.find((option) => option.value === optimisticMarker);

  const toggle = (value: string) => handleSubmit(optimisticMarker === value ? null : value);

  return (
    <section
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white shadow-[0_-4px_16px_rgb(17_24_39/0.08)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md flex-col gap-2 px-3 pt-2.5 pb-4 short:max-w-3xl short:flex-row short:items-center short:py-2">
        <div className="flex items-baseline justify-between px-1 short:sr-only">
          <H2 id={titleId} size="s">
            {t('event-management.proposal-page.your-review')}
          </H2>
          <p role="status" className="text-sm font-medium text-gray-600">
            {currentOption?.label ?? t('common.review.status.not-reviewed')}
          </p>
        </div>

        <div className="flex items-center gap-2 short:contents">
          <Link
            to={{ pathname: previousPath, search }}
            aria-disabled={previousPath ? undefined : 'true'}
            tabIndex={previousPath ? undefined : -1}
            className={NAVIGATION_STYLES}
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
            <span className="sr-only">{t('event-management.proposal-page.previous')}</span>
          </Link>

          <div className="flex h-13 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-1 short:order-2 short:h-12">
            {stars.map((option, index) => {
              const filled = index < filledStars;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={filled}
                  onClick={() => toggle(option.value)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg"
                >
                  <option.icon
                    className={cx('size-8.5 short:size-7', filled ? option.fill : 'stroke-gray-400')}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <Link
            to={{ pathname: nextPath, search }}
            aria-disabled={nextPath ? undefined : 'true'}
            tabIndex={nextPath ? undefined : -1}
            className={cx(NAVIGATION_STYLES, 'short:order-2')}
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
            <span className="sr-only">{t('event-management.proposal-page.next')}</span>
          </Link>
        </div>

        <div className="flex gap-2 short:order-1">
          {options.map((option) => {
            const styles = SELECTED_STYLES[option.value as MarkerValue];
            if (!styles) return null;
            const selected = option.value === optimisticMarker;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggle(option.value)}
                className={cx(
                  'flex h-11 flex-auto cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 text-sm font-medium whitespace-nowrap',
                  selected ? styles.button : 'border-gray-300 bg-white text-gray-700',
                )}
              >
                <option.icon
                  className={cx(
                    'size-5 shrink-0 max-[360px]:hidden short:max-md:hidden',
                    selected ? styles.icon : 'stroke-gray-500',
                  )}
                  aria-hidden="true"
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
