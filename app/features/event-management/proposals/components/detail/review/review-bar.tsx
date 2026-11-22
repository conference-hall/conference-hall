import { cx } from 'class-variance-authority';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { H2 } from '~/design-system/typography.tsx';
import {
  getReviewMarkerOptions,
  type MarkerValue,
} from '~/features/event-management/proposals/components/shared/review-markers.config.ts';
import type { UserReview } from '~/shared/types/proposals.types.ts';
import { useOptimisticReview } from './use-optimistic-review.ts';

const SELECTED_STYLES: Partial<Record<MarkerValue, { button: string; icon: string }>> = {
  'no-opinion': { button: 'border-gray-500 bg-gray-100 text-gray-900', icon: 'stroke-gray-600' },
  negative: { button: 'border-red-400 bg-red-50 text-red-700', icon: 'stroke-red-600' },
  positive: { button: 'border-rose-400 bg-rose-50 text-rose-700', icon: 'fill-red-400 stroke-red-400' },
};

type Props = { initialValues: UserReview };

export function ReviewBar({ initialValues }: Props) {
  const { t } = useTranslation();
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
      <div className="mx-auto flex max-w-md flex-col gap-2 px-3 pt-2.5 pb-4">
        <div className="flex items-baseline justify-between px-1">
          <H2 id={titleId} size="s">
            {t('event-management.proposal-page.your-review')}
          </H2>
          <p role="status" className="text-sm font-medium text-gray-600">
            {currentOption?.label ?? t('common.review.status.not-reviewed')}
          </p>
        </div>

        <div className="flex h-13 rounded-lg border border-gray-200 bg-gray-50 px-1">
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
                <option.icon className={cx('size-8.5', filled ? option.fill : 'stroke-gray-400')} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
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
                  className={cx('size-5 shrink-0', selected ? styles.icon : 'stroke-gray-500')}
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
