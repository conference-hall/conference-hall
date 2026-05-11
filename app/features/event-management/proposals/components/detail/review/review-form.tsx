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

type Props = { initialValues: UserReview };

export function ReviewForm({ initialValues }: Props) {
  const { t } = useTranslation();
  const { optimisticMarker, handleChange } = useOptimisticReview(initialValues);
  const markerOptions = getReviewMarkerOptions(t);

  return (
    <div className="space-y-2 p-4 lg:px-6 lg:py-4">
      <H2 size="s">{t('event-management.proposal-page.your-review')}</H2>
      <MarkerGroup
        options={markerOptions}
        value={optimisticMarker}
        onChange={handleChange}
        size="md"
        variant="ghost"
        withTooltip
      />
    </div>
  );
}

function useOptimisticReview(initialValues: UserReview) {
  const params = useParams();
  const fetcher = useFetcher({ key: `review:${params.proposal}` });
  const action = `/team/${params.team}/${params.event}/proposals/${params.proposal}`;

  let optimisticMarker = feelingAndNoteToMarker(initialValues.feeling ?? null, initialValues.note ?? null);

  if (fetcher.formData?.get('intent') === 'add-review') {
    const formData = fetcher.formData;
    const feeling = formData.get('feeling') as ReviewFeeling;
    const noteValue = formData.get('note');
    const note = noteValue === '' ? null : Number(noteValue);
    optimisticMarker = feelingAndNoteToMarker(feeling, note);
  } else if (fetcher.formData?.get('intent') === 'dismiss-review') {
    optimisticMarker = null;
  }

  const handleChange = (marker: string | null) => {
    if (marker) {
      const { feeling, note } = markerToFeelingAndNote(marker);
      fetcher.submit({ intent: 'add-review', feeling, note: note === null ? '' : note }, { method: 'POST', action });
    } else {
      fetcher.submit({ intent: 'dismiss-review' }, { method: 'POST', action });
    }
  };

  return { optimisticMarker, handleChange };
}
