import { useParams, useSearchParams, useSubmit } from '@remix-run/react';

import { H2 } from '~/design-system/typography.tsx';
import type { ReviewFeeling, UserReview } from '~/types/proposals.types.ts';

import { ReviewSelector } from './review-selector.tsx';

type Props = { initialValues: UserReview };

export function ReviewForm({ initialValues }: Props) {
  const [searchParams] = useSearchParams();
  const filters = searchParams.toString();

  const params = useParams();
  const actionUrl = `/team/${params.team}/${params.event}/reviews/${params.proposal}`;

  const submit = useSubmit();
  const handleSubmit = (feeling: ReviewFeeling, note: number | null) => {
    submit(
      { intent: 'add-review', feeling, note: note === null ? '' : note },
      { method: 'POST', action: filters ? `${actionUrl}?${filters}` : actionUrl },
    );
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">Your review</H2>

      <ReviewSelector value={initialValues} onChange={handleSubmit} />
    </div>
  );
}
