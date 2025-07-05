import { useTranslation } from 'react-i18next';
import { GlobalReviewNote } from '~/routes/components/reviews/review-note.tsx';
import { H2, Text } from '~/shared/design-system/typography.tsx';
import type { GlobalReview, UserReview } from '~/types/proposals.types.ts';

type Props = { review: GlobalReview | null; userReview: UserReview };

export function ReviewDetails({ review, userReview }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <H2 size="s">{t('event-management.proposal-page.reviews.label')}</H2>

      {review && (
        <div className="flex items-center justify-between">
          <Text weight="medium">{t('event-management.proposal-page.reviews.global')}</Text>
          <div className="flex gap-4">
            <GlobalReviewNote feeling="NEUTRAL" note={review?.average} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Text weight="medium">{t('event-management.proposal-page.your-review')}</Text>
        <GlobalReviewNote feeling={userReview.feeling} note={userReview.note} />
      </div>
    </div>
  );
}
