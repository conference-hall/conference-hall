import { useHotkeys } from '@tanstack/react-hotkeys';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher, useParams } from 'react-router';
import { MarkerGroup } from '~/design-system/forms/marker-group.tsx';
import { H2 } from '~/design-system/typography.tsx';
import {
  feelingAndNoteToMarker,
  getReviewMarkerOptions,
  type MarkerValue,
  markerToFeelingAndNote,
  REVIEW_MARKER_HOTKEYS,
} from '~/features/event-management/proposals/components/shared/review-markers.config.ts';
import type { ReviewFeeling, UserReview } from '~/shared/types/proposals.types.ts';
import { isFocusedOutsidePage } from '../is-focused-outside-page.ts';

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

function useOptimisticReview(initialValues: UserReview) {
  const params = useParams();
  const fetcher = useFetcher({ key: `review:${params.proposal}` });

  let optimisticMarker = feelingAndNoteToMarker(initialValues.feeling ?? null, initialValues.note ?? null);

  if (fetcher.formData?.get('intent') === 'add-review') {
    const formData = fetcher.formData;
    const feeling = formData.get('feeling') as ReviewFeeling;
    const noteValue = formData.get('note');
    const note = noteValue === '' ? null : Number(noteValue);
    optimisticMarker = feelingAndNoteToMarker(feeling, note);
  } else if (fetcher.formData?.get('intent') === 'clear-review') {
    optimisticMarker = null;
  }

  const handleSubmit = (marker: string | null) => {
    const action = `/team/${params.team}/${params.event}/proposals/${params.proposal}`;
    if (!marker) {
      fetcher.submit({ intent: 'clear-review' }, { method: 'POST', action });
      return;
    }
    const { feeling, note } = markerToFeelingAndNote(marker);
    fetcher.submit({ intent: 'add-review', feeling, note: note === null ? '' : note }, { method: 'POST', action });
  };

  return { optimisticMarker, handleSubmit };
}
