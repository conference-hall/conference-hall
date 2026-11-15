import { useHotkeys } from '@tanstack/react-hotkeys';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher, useParams } from 'react-router';
import { MarkerGroup } from '~/design-system/forms/marker-group.tsx';
import { H2 } from '~/design-system/typography.tsx';
import {
  feelingAndNoteToMarker,
  getReviewMarkerOptions,
  markerToFeelingAndNote,
} from '~/features/event-management/proposals/components/shared/review-markers.config.ts';
import type { ReviewFeeling, UserReview } from '~/shared/types/proposals.types.ts';
import { isFocusedOutsidePage } from '../is-focused-outside-page.ts';

const MARKER_HOTKEYS = {
  'no-opinion': '-',
  negative: '0',
  'neutral-1': '1',
  'neutral-2': '2',
  'neutral-3': '3',
  'neutral-4': '4',
  'neutral-5': '5',
  positive: '+',
} as const;

type Props = { initialValues: UserReview; pageRef: React.RefObject<HTMLElement | null> };

export function ReviewForm({ initialValues, pageRef }: Props) {
  const { t } = useTranslation();
  const { optimisticMarker, handleSubmit } = useOptimisticReview(initialValues);
  const markerOptions = getReviewMarkerOptions(t).map((option) => ({
    ...option,
    hotkey: MARKER_HOTKEYS[option.value as keyof typeof MARKER_HOTKEYS],
  }));
  const currentOption = markerOptions.find((option) => option.value === optimisticMarker);

  useHotkeys(
    markerOptions.map(({ value, hotkey }) => ({
      hotkey,
      callback: () => {
        if (isFocusedOutsidePage(pageRef)) return;
        handleSubmit(optimisticMarker === value ? null : value);
      },
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
        {currentOption?.label}
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
