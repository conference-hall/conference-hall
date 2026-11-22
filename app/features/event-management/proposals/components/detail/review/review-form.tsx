import { useHotkeys } from '@tanstack/react-hotkeys';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { MarkerGroup } from '~/design-system/forms/marker-group.tsx';
import { H2 } from '~/design-system/typography.tsx';
import {
  getReviewMarkerOptions,
  type MarkerValue,
  REVIEW_MARKER_HOTKEYS,
} from '~/features/event-management/proposals/components/shared/review-markers.config.ts';
import type { UserReview } from '~/shared/types/proposals.types.ts';
import { isFocusedOutsidePage } from '../is-focused-outside-page.ts';
import { useOptimisticReview } from './use-optimistic-review.ts';

type Props = { initialValues: UserReview; pageRef: React.RefObject<HTMLElement | null> };

export function ReviewForm({ initialValues, pageRef }: Props) {
  const { t } = useTranslation();
  const { optimisticMarker, handleSubmit } = useOptimisticReview(initialValues);
  const markerOptions = getReviewMarkerOptions(t).map((option) => ({
    ...option,
    hotkey: REVIEW_MARKER_HOTKEYS[option.value as MarkerValue].toLowerCase(),
  }));
  const currentOption = markerOptions.find((option) => option.value === optimisticMarker);

  useHotkeys(
    markerOptions.map(({ value }) => ({
      hotkey: REVIEW_MARKER_HOTKEYS[value as MarkerValue],
      callback: (event) => {
        if (isFocusedOutsidePage(pageRef)) return;
        event.preventDefault();
        handleSubmit(optimisticMarker === value ? null : value);
      },
      options: { requireReset: true, preventDefault: false, stopPropagation: false },
    })),
  );

  return (
    <div className="space-y-2 p-4 lg:px-6 lg:py-4">
      <H2 size="s">{t('event-management.proposal-page.your-review')}</H2>
      <MarkerGroup
        options={markerOptions}
        value={optimisticMarker}
        onChange={handleSubmit}
        size="md"
        variant="ghost"
        withTooltip
      />
      <p role="status" className="sr-only">
        {currentOption?.label ?? t('common.review.status.not-reviewed')}
      </p>
    </div>
  );
}
