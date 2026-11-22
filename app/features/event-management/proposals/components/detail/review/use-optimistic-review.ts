import { useFetcher, useParams } from 'react-router';
import {
  feelingAndNoteToMarker,
  markerToFeelingAndNote,
} from '~/features/event-management/proposals/components/shared/review-markers.config.ts';
import type { ReviewFeeling, UserReview } from '~/shared/types/proposals.types.ts';

export function useOptimisticReview(initialValues: UserReview) {
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
