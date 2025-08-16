import { useTranslation } from 'react-i18next';
import { useFetcher, useParams } from 'react-router';
import { H2 } from '~/design-system/typography.tsx';
import type { ReviewFeeling, UserReview } from '~/shared/types/proposals.types.ts';
import { ReviewSelector } from './review-selector.tsx';

type Props = { initialValues: UserReview };

export function ReviewForm({ initialValues }: Props) {
  const { t } = useTranslation();
  const { optimisticReview, handleSubmit } = useOptimisticReview(initialValues);

  return (
    <div className="space-y-2 p-4 lg:px-6 lg:py-4">
      <H2 size="s">{t('event-management.proposal-page.your-review')}</H2>
      <ReviewSelector value={optimisticReview} onChange={handleSubmit} />
    </div>
  );
}

function useOptimisticReview(initialValues: UserReview) {
  const params = useParams();
  const fetcher = useFetcher({ key: `add-review:${params.proposal}` });

  let optimisticReview = { ...initialValues };

  if (fetcher.formData?.get('intent') === 'add-review') {
    const formData = fetcher.formData;
    const feeling = formData.get('feeling') as ReviewFeeling;
    const noteValue = formData.get('note');
    const note = noteValue === '' ? null : Number(noteValue);
    optimisticReview = { feeling, note };
  }

  const handleSubmit = (feeling: ReviewFeeling, note: number | null) => {
    fetcher.submit(
      { intent: 'add-review', feeling, note: note === null ? '' : note },
      { method: 'POST', action: `/team/${params.team}/${params.event}/reviews/${params.proposal}` },
    );
  };

  return { optimisticReview, handleSubmit };
}
