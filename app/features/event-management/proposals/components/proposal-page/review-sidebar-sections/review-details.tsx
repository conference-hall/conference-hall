import { useTranslation } from 'react-i18next';
import { H2, Text } from '~/design-system/typography.tsx';
import { GlobalReviewNote } from '~/features/event-management/proposals/components/review-note.tsx';
import type { GlobalReview, UserReview } from '~/shared/types/proposals.types.ts';

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
